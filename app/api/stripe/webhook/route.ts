import Stripe from "stripe";
import supabaseAdmin from "@/lib/supabase-admin";

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY!
);

export async function POST(req: Request) {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return new Response("Missing stripe-signature", {
            status: 400,
        });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is not configured");

        return new Response("Webhook not configured", {
            status: 500,
        });
    }

    const rawBody = Buffer.from(await req.arrayBuffer());

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret
        );
    } catch (error) {
        console.error("Stripe webhook signature verification failed");

        return new Response("Invalid signature", {
            status: 400,
        });
    }

    /*
     * ---------------------------------------------------------
     * IDEMPOTENCY
     * ---------------------------------------------------------
     *
     * We only mark the event as processed AFTER the handler
     * succeeds.
     *
     * If processing fails, Stripe receives HTTP 500 and can
     * retry the event.
     */

    const { data: existingEvent } = await supabaseAdmin
        .from("stripe_webhook_events")
        .select("id, processed_at")
        .eq("event_id", event.id)
        .maybeSingle();

    if (existingEvent?.processed_at) {
        return Response.json({
            received: true,
            duplicate: true,
        });
    }

    if (!existingEvent) {
        const { error } = await supabaseAdmin
            .from("stripe_webhook_events")
            .insert({
                event_id: event.id,
                event_type: event.type,
                payload: event,
            });

        if (error) {
            /*
             * Another webhook request may have inserted the same
             * event concurrently.
             *
             * Re-check the event before deciding this is fatal.
             */
            const { data: concurrentEvent } = await supabaseAdmin
                .from("stripe_webhook_events")
                .select("processed_at")
                .eq("event_id", event.id)
                .maybeSingle();

            if (concurrentEvent?.processed_at) {
                return Response.json({
                    received: true,
                    duplicate: true,
                });
            }

            console.error(
                "Failed to register Stripe webhook event",
                error
            );

            return Response.json(
                { error: "Webhook persistence failed" },
                { status: 500 }
            );
        }
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(
                    event.data.object as Stripe.Checkout.Session
                );
                break;

            case "payment_intent.succeeded":
                await handlePaymentIntentSucceeded(
                    event.data.object as Stripe.PaymentIntent
                );
                break;

            case "payment_intent.payment_failed":
                await handlePaymentIntentFailed(
                    event.data.object as Stripe.PaymentIntent
                );
                break;

            case "invoice.paid":
                await handleInvoicePaid(
                    event.data.object as Stripe.Invoice
                );
                break;

            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(
                    event.data.object as Stripe.Invoice
                );
                break;

            case "charge.refunded":
                await handleChargeRefunded(
                    event.data.object as Stripe.Charge
                );
                break;

            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await handleSubscriptionChanged(
                    event.data.object as Stripe.Subscription
                );
                break;

            default:
                // Event is valid but irrelevant for our business logic.
                break;
        }

        await supabaseAdmin
            .from("stripe_webhook_events")
            .update({
                processed_at: new Date().toISOString(),
                error_message: null,
            })
            .eq("event_id", event.id);

        return Response.json({
            received: true,
        });
    } catch (error) {
        console.error(
            `Stripe webhook processing failed: ${event.type}`,
            error
        );

        await supabaseAdmin
            .from("stripe_webhook_events")
            .update({
                error_message:
                    error instanceof Error
                        ? error.message
                        : "Unknown webhook processing error",
            })
            .eq("event_id", event.id);

        /*
         * IMPORTANT:
         * Return 500 so Stripe can retry.
         */
        return Response.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}


/*
 * ---------------------------------------------------------
 * CHECKOUT SESSION
 * ---------------------------------------------------------
 *
 * We do NOT mark a donation as completed here.
 *
 * This only stores the relationship between Checkout and
 * our donation.
 */
async function handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
) {
    const donationId =
        session.metadata?.donation_id ??
        session.client_reference_id;

    if (!donationId) {
        throw new Error(
            "checkout.session.completed without donation_id"
        );
    }

    const update: Record<string, unknown> = {
        stripe_checkout_session_id: session.id,
    };

    const donorEmail =
        session.customer_details?.email?.trim().toLowerCase() ?? null;

    if (donorEmail) {
        update.donor_email = donorEmail;

        // Buscar al usuario por email
        const { data: person, error: personError } =
            await supabaseAdmin
                .from("persons")
                .select("id")
                .ilike("email", donorEmail)
                .maybeSingle();

        if (personError) {
            throw new Error(
                `Failed finding person by email: ${personError.message}`
            );
        }

        if (person?.id) {
            update.person_id = person.id;
        }
    }

    if (session.customer) {
        update.stripe_customer_id =
            typeof session.customer === "string"
                ? session.customer
                : session.customer.id;
    }

    if (session.payment_intent) {
        update.stripe_payment_intent_id =
            typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent.id;
    }

    if (session.subscription) {
        update.stripe_subscription_id =
            typeof session.subscription === "string"
                ? session.subscription
                : session.subscription.id;
    }

    const { error } = await supabaseAdmin
        .from("donations")
        .update(update)
        .eq("id", donationId);

    if (error) {
        throw new Error(
            `Failed updating donation from Checkout: ${error.message}`
        );
    }
}


/*
 * ---------------------------------------------------------
 * PAYMENT INTENT SUCCEEDED
 * ---------------------------------------------------------
 *
 * One-time payments arrive here.
 *
 * For subscriptions, the corresponding invoice.paid event
 * is responsible for recording the recurring payment.
 */
async function handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
) {
    const donation =
        await findDonationForPaymentIntent(paymentIntent);

    /*
     * Si no podemos relacionar este PaymentIntent con una
     * donation mediante nuestra metadata/referencia, no lo
     * procesamos aquí.
     *
     * Los pagos de suscripciones se procesan mediante
     * invoice.paid.
     */
    if (!donation) {
        return;
    }

    const amount =
        paymentIntent.amount_received > 0
            ? paymentIntent.amount_received
            : paymentIntent.amount;

    const payment = await upsertDonationPayment({
        donationId: donation.id,
        amount: amount / 100,
        currency:
            paymentIntent.currency.toUpperCase(),
        stripePaymentIntentId: paymentIntent.id,
        status: "succeeded",
        paidAt: new Date().toISOString(),
    });

    await completeDonationAndApplyProjects(
        donation.id,
        payment.id,
        payment.amount
    );
}


/*
 * ---------------------------------------------------------
 * PAYMENT INTENT FAILED
 * ---------------------------------------------------------
 */
async function handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
) {
    const donation =
        await findDonationForPaymentIntent(paymentIntent);

    if (!donation) {
        return;
    }

    await upsertDonationPayment({
        donationId: donation.id,
        amount: paymentIntent.amount / 100,
        currency:
            paymentIntent.currency.toUpperCase(),
        stripePaymentIntentId: paymentIntent.id,
        status: "failed",
    });

    /*
     * Do not turn an already completed recurring donation
     * into failed just because a later PaymentIntent failed.
     */
    if (donation.status === "pending") {
        const { error } = await supabaseAdmin
            .from("donations")
            .update({
                status: "failed",
            })
            .eq("id", donation.id);

        if (error) {
            throw new Error(
                `Failed marking donation failed: ${error.message}`
            );
        }
    }
}


/*
 * ---------------------------------------------------------
 * INVOICE PAID
 * ---------------------------------------------------------
 *
 * This is the important event for recurring payments.
 *
 * Stripe documents invoice.paid as the event sent when an
 * invoice is successfully paid. :contentReference[oaicite:2]{index=2}
 */
async function handleInvoicePaid(
    invoice: Stripe.Invoice
) {
    const donation =
        await findDonationForInvoice(invoice);

    if (!donation) {
        throw new Error(
            `Donation not found for invoice ${invoice.id}`
        );
    }

    const subscriptionId =
        getSubscriptionIdFromInvoice(invoice);

    const payment = await upsertDonationPayment({
        donationId: donation.id,
        amount:
            (invoice.amount_paid ??
                invoice.total ??
                0) / 100,
        currency:
            (invoice.currency ?? "eur").toUpperCase(),
        stripeInvoiceId: invoice.id,
        status: "succeeded",
        paidAt: new Date().toISOString(),
    });

    const update: Record<string, unknown> = {
        status: "completed",
        completed_at:
            donation.completed_at ??
            new Date().toISOString(),
    };

    if (subscriptionId) {
        update.stripe_subscription_id =
            subscriptionId;
    }

    const { error } = await supabaseAdmin
        .from("donations")
        .update(update)
        .eq("id", donation.id);

    if (error) {
        throw new Error(
            `Failed completing recurring donation: ${error.message}`
        );
    }

    await applyProjectImpactOnce(
        donation.id,
        payment.id,
        payment.amount
    );
}


/*
 * ---------------------------------------------------------
 * INVOICE PAYMENT FAILED
 * ---------------------------------------------------------
 */
async function handleInvoicePaymentFailed(
    invoice: Stripe.Invoice
) {
    const donation =
        await findDonationForInvoice(invoice);

    if (!donation) {
        return;
    }

    await upsertDonationPayment({
        donationId: donation.id,
        amount:
            (invoice.amount_due ??
                invoice.total ??
                0) / 100,
        currency:
            (invoice.currency ?? "eur").toUpperCase(),
        stripeInvoiceId: invoice.id,
        status: "failed",
    });

    /*
     * Solo una donation que todavía esté pendiente
     * pasa a failed.
     *
     * Una donation mensual ya establecida sigue
     * representando la suscripción aunque un cobro
     * concreto falle.
     */
    if (donation.status === "pending") {
        const { error } = await supabaseAdmin
            .from("donations")
            .update({
                status: "failed",
            })
            .eq("id", donation.id);

        if (error) {
            throw new Error(
                `Failed marking recurring donation failed: ${error.message}`
            );
        }
    }
}


/*
 * ---------------------------------------------------------
 * SUBSCRIPTION CHANGED
 * ---------------------------------------------------------
 */
async function handleSubscriptionChanged(
    subscription: Stripe.Subscription
) {
    const donationId =
        subscription.metadata?.donation_id;

    if (!donationId) {
        return;
    }

    const update: Record<string, unknown> = {
        stripe_subscription_id: subscription.id,
    };

    if (subscription.customer) {
        update.stripe_customer_id =
            typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id;
    }

    /*
     * Do not mark the donation as failed merely because
     * a subscription becomes canceled/deleted.
     *
     * The donation record represents the donation/subscription,
     * while donation_payments represents individual successful
     * and failed payments.
     */
    const { error } = await supabaseAdmin
        .from("donations")
        .update(update)
        .eq("id", donationId);

    if (error) {
        throw new Error(
            `Failed updating subscription reference: ${error.message}`
        );
    }
}


/*
 * ---------------------------------------------------------
 * REFUND
 * ---------------------------------------------------------
 */
async function handleChargeRefunded(
    charge: Stripe.Charge
) {
    const paymentIntentId =
        typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : null;

    let payment = null;

    if (paymentIntentId) {
        const { data } = await supabaseAdmin
            .from("donation_payments")
            .select("*")
            .eq(
                "stripe_payment_intent_id",
                paymentIntentId
            )
            .maybeSingle();

        payment = data;
    }

    if (!payment) {
        const donationId =
            charge.metadata?.donation_id;

        if (!donationId) {
            return;
        }

        const { data } = await supabaseAdmin
            .from("donations")
            .select("id")
            .eq("id", donationId)
            .maybeSingle();

        if (!data) {
            return;
        }

        payment = await upsertDonationPayment({
            donationId: data.id,
            amount:
                (charge.amount_refunded ?? 0) /
                100,
            currency:
                (charge.currency ?? "eur").toUpperCase(),
            stripePaymentIntentId:
                paymentIntentId,
            stripeChargeId: charge.id,
            status: "refunded",
        });
    } else {
        const { data, error } = await supabaseAdmin
            .from("donation_payments")
            .update({
                status: "refunded",
            })
            .eq("id", payment.id)
            .select("*")
            .single();

        if (error || !data) {
            throw new Error(
                `Failed marking payment refunded`
            );
        }

        payment = data;
    }

    /*
     * Only mark the overall donation refunded if the entire
     * payment has actually been refunded.
     */
    const fullyRefunded =
        charge.amount_refunded >= charge.amount;

    if (fullyRefunded) {
        const { error } = await supabaseAdmin
            .from("donations")
            .update({
                status: "refunded",
            })
            .eq("id", payment.donation_id);

        if (error) {
            throw new Error(
                `Failed marking donation refunded: ${error.message}`
            );
        }
    }
}


/*
 * ---------------------------------------------------------
 * FIND DONATION
 * ---------------------------------------------------------
 */

async function findDonationForPaymentIntent(
    paymentIntent: Stripe.PaymentIntent
) {
    const { data: byPaymentIntent } =
        await supabaseAdmin
            .from("donations")
            .select("*")
            .eq(
                "stripe_payment_intent_id",
                paymentIntent.id
            )
            .maybeSingle();

    if (byPaymentIntent) {
        return byPaymentIntent;
    }

    const donationId =
        paymentIntent.metadata?.donation_id;

    if (!donationId) {
        return null;
    }

    const { data: byMetadata } =
        await supabaseAdmin
            .from("donations")
            .select("*")
            .eq("id", donationId)
            .maybeSingle();

    return byMetadata;
}

function getSubscriptionIdFromInvoice(
    invoice: Stripe.Invoice
): string | null {
    const parent = invoice.parent;

    if (
        parent &&
        parent.type === "subscription_details"
    ) {
        const subscription =
            parent.subscription_details.subscription;

        if (typeof subscription === "string") {
            return subscription;
        }

        if (
            subscription &&
            typeof subscription === "object" &&
            "id" in subscription
        ) {
            return subscription.id;
        }
    }

    return null;
}

async function findDonationForInvoice(
    invoice: Stripe.Invoice
) {
    const metadataDonationId =
        invoice.metadata?.donation_id;

    if (metadataDonationId) {
        const { data } = await supabaseAdmin
            .from("donations")
            .select("*")
            .eq("id", metadataDonationId)
            .maybeSingle();

        if (data) {
            return data;
        }
    }

    const subscriptionId =
        getSubscriptionIdFromInvoice(invoice);

    if (!subscriptionId) {
        return null;
    }

    const { data: bySubscription } =
        await supabaseAdmin
            .from("donations")
            .select("*")
            .eq(
                "stripe_subscription_id",
                subscriptionId
            )
            .maybeSingle();

    if (bySubscription) {
        return bySubscription;
    }

    const subscription =
        await stripe.subscriptions.retrieve(
            subscriptionId
        );

    const donationId =
        subscription.metadata?.donation_id;

    if (!donationId) {
        return null;
    }

    const { data: fromSubscription } =
        await supabaseAdmin
            .from("donations")
            .select("*")
            .eq("id", donationId)
            .maybeSingle();

    return fromSubscription;
}


/*
 * ---------------------------------------------------------
 * DONATION PAYMENT
 * ---------------------------------------------------------
 */

async function upsertDonationPayment(params: {
    donationId: string;
    amount: number;
    currency: string;
    stripePaymentIntentId?: string | null;
    stripeInvoiceId?: string | null;
    stripeChargeId?: string | null;
    status: "succeeded" | "failed" | "refunded";
    paidAt?: string | null;
}) {
    let existingQuery = supabaseAdmin
        .from("donation_payments")
        .select("*");

    if (params.stripePaymentIntentId) {
        const { data } = await existingQuery
            .eq(
                "stripe_payment_intent_id",
                params.stripePaymentIntentId
            )
            .maybeSingle();

        if (data) {
            const { data: updated, error } =
                await supabaseAdmin
                    .from("donation_payments")
                    .update({
                        donation_id:
                            params.donationId,
                        amount: params.amount,
                        currency: params.currency,
                        stripe_invoice_id:
                            params.stripeInvoiceId ??
                            data.stripe_invoice_id,
                        stripe_charge_id:
                            params.stripeChargeId ??
                            data.stripe_charge_id,
                        status: params.status,
                        paid_at:
                            params.paidAt ??
                            data.paid_at,
                    })
                    .eq("id", data.id)
                    .select("*")
                    .single();

            if (error || !updated) {
                throw new Error(
                    `Failed updating donation_payment`
                );
            }

            return updated;
        }
    }

    if (params.stripeInvoiceId) {
        const { data } = await supabaseAdmin
            .from("donation_payments")
            .select("*")
            .eq(
                "stripe_invoice_id",
                params.stripeInvoiceId
            )
            .maybeSingle();

        if (data) {
            const { data: updated, error } =
                await supabaseAdmin
                    .from("donation_payments")
                    .update({
                        donation_id:
                            params.donationId,
                        amount: params.amount,
                        currency: params.currency,
                        stripe_payment_intent_id:
                            params.stripePaymentIntentId ??
                            data.stripe_payment_intent_id,
                        stripe_charge_id:
                            params.stripeChargeId ??
                            data.stripe_charge_id,
                        status: params.status,
                        paid_at:
                            params.paidAt ??
                            data.paid_at,
                    })
                    .eq("id", data.id)
                    .select("*")
                    .single();

            if (error || !updated) {
                throw new Error(
                    `Failed updating donation_payment`
                );
            }

            return updated;
        }
    }

    const { data, error } =
        await supabaseAdmin
            .from("donation_payments")
            .insert({
                donation_id:
                    params.donationId,
                amount: params.amount,
                currency: params.currency,
                stripe_payment_intent_id:
                    params.stripePaymentIntentId ??
                    null,
                stripe_invoice_id:
                    params.stripeInvoiceId ??
                    null,
                stripe_charge_id:
                    params.stripeChargeId ??
                    null,
                status: params.status,
                paid_at:
                    params.paidAt ?? null,
            })
            .select("*")
            .single();

    if (error || !data) {
        throw new Error(
            `Failed inserting donation_payment: ${error?.message ?? "unknown"
            }`
        );
    }

    return data;
}


/*
 * ---------------------------------------------------------
 * DONATION COMPLETION + PROJECT IMPACT
 * ---------------------------------------------------------
 */

async function completeDonationAndApplyProjects(
    donationId: string,
    paymentId: string,
    paymentAmount: number
) {
    const { data: donation, error } =
        await supabaseAdmin
            .from("donations")
            .select("id, status")
            .eq("id", donationId)
            .maybeSingle();

    if (error || !donation) {
        throw new Error(
            `Donation ${donationId} not found`
        );
    }

    await supabaseAdmin
        .from("donations")
        .update({
            status: "completed",
            completed_at:
                donation.status === "completed"
                    ? undefined
                    : new Date().toISOString(),
        })
        .eq("id", donationId);

    /*
     * Use donation payment ID to make project update idempotent.
     */
    await applyProjectImpactOnce(
        donationId,
        paymentId,
        paymentAmount
    );
}


async function applyProjectImpactOnce(
    donationId: string,
    paymentId: string,
    paymentAmount: number
) {
    const { data: projects, error } =
        await supabaseAdmin
            .from("donation_projects")
            .select("project_id, amount")
            .eq("donation_id", donationId);

    if (error) {
        throw new Error(
            `Failed loading donation projects: ${error.message}`
        );
    }

    if (!projects || projects.length === 0) {
        return;
    }

    /*
     * Use the actual allocation stored in donation_projects,
     * not the total payment if a donation can contain several
     * project allocations.
     */
    for (const project of projects) {
        const { error: rpcError } =
            await supabaseAdmin.rpc(
                "increment_project_amount_if_donation_payment",
                {
                    p_donation_payment_id:
                        paymentId,
                    p_project_id:
                        project.project_id,
                    p_amount:
                        Number(project.amount),
                    p_donation_id:
                        donationId,
                }
            );

        if (rpcError) {
            throw new Error(
                `Failed updating project ${project.project_id}: ${rpcError.message}`
            );
        }
    }
}