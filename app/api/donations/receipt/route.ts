import { NextResponse } from "next/server";
import Stripe from "stripe";
import supabaseAdmin from "@/lib/supabase-admin";

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY!
);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const paymentId =
            searchParams.get("payment_id");

        if (!paymentId) {
            return NextResponse.json(
                { error: "Missing payment_id" },
                { status: 400 }
            );
        }

        /*
         * -----------------------------------------------------
         * AUTH
         * -----------------------------------------------------
         */

        const authHeader =
            req.headers.get("authorization");

        if (
            !authHeader?.startsWith("Bearer ")
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const token = authHeader.slice(7);

        const { data: userData, error: userError } =
            await supabaseAdmin.auth.getUser(token);

        if (
            userError ||
            !userData?.user
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = userData.user;

        /*
         * -----------------------------------------------------
         * FIND PERSON
         * -----------------------------------------------------
         */

        let personId: string | null =
            null;

        const { data: personByAuthId } =
            await supabaseAdmin
                .from("persons")
                .select("id")
                .eq(
                    "auth_user_id",
                    user.id
                )
                .maybeSingle();

        if (personByAuthId?.id) {
            personId = personByAuthId.id;
        } else if (user.email) {
            const { data: personByEmail } =
                await supabaseAdmin
                    .from("persons")
                    .select("id")
                    .ilike(
                        "email",
                        user.email
                    )
                    .maybeSingle();

            if (personByEmail?.id) {
                personId =
                    personByEmail.id;
            }
        }

        if (!personId) {
            return NextResponse.json(
                { error: "Person not found" },
                { status: 404 }
            );
        }

        /*
         * -----------------------------------------------------
         * LOAD PAYMENT + VERIFY OWNERSHIP
         * -----------------------------------------------------
         */

        const { data: payment, error } =
            await supabaseAdmin
                .from("donation_payments")
                .select(`
                    id,
                    donation_id,
                    stripe_payment_intent_id,
                    stripe_invoice_id,
                    stripe_charge_id,
                    status,
                    donations!inner (
                        id,
                        person_id
                    )
                `)
                .eq("id", paymentId)
                .eq(
                    "donations.person_id",
                    personId
                )
                .maybeSingle();

        if (error) {
            console.error(
                "Error loading donation payment:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed loading payment",
                },
                { status: 500 }
            );
        }

        if (!payment) {
            return NextResponse.json(
                {
                    error:
                        "Payment not found",
                },
                { status: 404 }
            );
        }

        /*
         * -----------------------------------------------------
         * ONLY SUCCESSFUL PAYMENTS
         * -----------------------------------------------------
         */

        if (
            payment.status !==
            "succeeded"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Receipt not available for this payment",
                },
                { status: 404 }
            );
        }

        /*
         * -----------------------------------------------------
         * 1. DIRECT CHARGE
         * -----------------------------------------------------
         */

        if (
            payment.stripe_charge_id
        ) {
            const charge =
                await stripe.charges.retrieve(
                    payment.stripe_charge_id
                );

            if (charge.receipt_url) {
                return NextResponse.json(
                    {
                        url:
                            charge.receipt_url,
                    }
                );
            }
        }

        /*
         * -----------------------------------------------------
         * 2. PAYMENT INTENT
         * -----------------------------------------------------
         */

        if (
            payment.stripe_payment_intent_id
        ) {
            const paymentIntent =
                await stripe.paymentIntents.retrieve(
                    payment.stripe_payment_intent_id,
                    {
                        expand: [
                            "latest_charge",
                        ],
                    }
                );

            const latestCharge =
                paymentIntent.latest_charge;

            if (
                latestCharge &&
                typeof latestCharge !==
                    "string" &&
                latestCharge.receipt_url
            ) {
                return NextResponse.json(
                    {
                        url:
                            latestCharge.receipt_url,
                    }
                );
            }

            if (
                typeof latestCharge ===
                "string"
            ) {
                const charge =
                    await stripe.charges.retrieve(
                        latestCharge
                    );

                if (
                    charge.receipt_url
                ) {
                    return NextResponse.json(
                        {
                            url:
                                charge.receipt_url,
                        }
                    );
                }
            }
        }

        /*
         * -----------------------------------------------------
         * 3. INVOICE
         * -----------------------------------------------------
         *
         * We try the PaymentIntent associated
         * with the invoice.
         */

        if (
            payment.stripe_invoice_id
        ) {
            const invoice =
                await stripe.invoices.retrieve(
                    payment.stripe_invoice_id,
                    {
                        expand: [
                            "payment_intent",
                        ],
                    }
                );

            const invoicePaymentIntent =
                (invoice as any)
                    .payment_intent;

            const paymentIntentId =
                typeof invoicePaymentIntent ===
                "string"
                    ? invoicePaymentIntent
                    : invoicePaymentIntent?.id;

            if (paymentIntentId) {
                const paymentIntent =
                    await stripe.paymentIntents.retrieve(
                        paymentIntentId,
                        {
                            expand: [
                                "latest_charge",
                            ],
                        }
                    );

                const latestCharge =
                    paymentIntent.latest_charge;

                if (
                    latestCharge &&
                    typeof latestCharge !==
                        "string" &&
                    latestCharge.receipt_url
                ) {
                    return NextResponse.json(
                        {
                            url:
                                latestCharge.receipt_url,
                        }
                    );
                }

                if (
                    typeof latestCharge ===
                    "string"
                ) {
                    const charge =
                        await stripe.charges.retrieve(
                            latestCharge
                        );

                    if (
                        charge.receipt_url
                    ) {
                        return NextResponse.json(
                            {
                                url:
                                    charge.receipt_url,
                            }
                        );
                    }
                }
            }
        }

        return NextResponse.json(
            {
                error:
                    "No receipt available",
            },
            { status: 404 }
        );
    } catch (error) {
        console.error(
            "Donation receipt API error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Internal server error",
            },
            { status: 500 }
        );
    }
}