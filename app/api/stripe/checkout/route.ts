import { NextResponse } from "next/server";
import Stripe from "stripe";
import { donations } from "@/data/donations";
import supabaseAdmin from "@/lib/supabase-admin";

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // =========================================================
        // PAYLOAD
        // =========================================================

        const {
            origin,
            amount,
            isMonthly,
            currency = "EUR",
            confirmedAmounts,
        } = body;

        if (!origin) {
            return NextResponse.json(
                { error: "Invalid payload" },
                { status: 400 }
            );
        }

        if (
            origin.type !== "cart" &&
            (!amount || Number(amount) <= 0)
        ) {
            return NextResponse.json(
                { error: "Invalid payload" },
                { status: 400 }
            );
        }

        // =========================================================
        // DONATION FREQUENCY
        // =========================================================
        //
        // El selector del frontend debe enviar:
        //
        // isMonthly: false -> pago único
        // isMonthly: true  -> suscripción mensual
        //
        // Convertimos explícitamente a boolean para evitar que
        // valores como "false" (string) se interpreten como true.
        //

        const recurring = isMonthly === true;

        // =========================================================
        // AUTHENTICATED USER
        // =========================================================

        let personId: string | null = null;

        const authHeader =
            req.headers.get("authorization");

        console.info("[checkout auth]", {
            hasAuthorizationHeader: Boolean(authHeader),
            hasBearerToken: Boolean(
                authHeader?.startsWith("Bearer ") &&
                authHeader.slice(7).trim()
            ),
        });

        if (authHeader) {
            if (!authHeader.startsWith("Bearer ")) {
                return NextResponse.json(
                    { error: "Invalid authentication header" },
                    { status: 401 }
                );
            }

            const token = authHeader.slice(7).trim();

            if (!token) {
                return NextResponse.json(
                    { error: "Missing authentication token" },
                    { status: 401 }
                );
            }

            const {
                data: userData,
                error: userErr,
            } = await supabaseAdmin.auth.getUser(token);

            if (userErr || !userData?.user) {
                return NextResponse.json(
                    { error: "Invalid authentication token" },
                    { status: 401 }
                );
            }

            const user = userData.user;

            console.info("[checkout auth]", {
                authUserId: user.id,
            });

            const {
                data: personByAuthId,
                error: authPersonError,
            } = await supabaseAdmin
                .from("persons")
                .select("id")
                .eq("auth_user_id", user.id)
                .maybeSingle();

            if (authPersonError) {
                console.error(
                    "Error buscando persona por auth_user_id:",
                    authPersonError
                );

                return NextResponse.json(
                    { error: "Unable to resolve authenticated person" },
                    { status: 500 }
                );
            }

            if (personByAuthId?.id) {
                personId = personByAuthId.id;
            } else if (user.email) {
                const {
                    data: personByEmail,
                    error: emailPersonError,
                } = await supabaseAdmin
                    .from("persons")
                    .select("id")
                    .eq("email", user.email)
                    .maybeSingle();

                if (emailPersonError) {
                    console.error(
                        "Error buscando persona por email:",
                        emailPersonError
                    );

                    return NextResponse.json(
                        { error: "Unable to resolve authenticated person" },
                        { status: 500 }
                    );
                }

                if (personByEmail?.id) {
                    personId = personByEmail.id;

                    const { error: linkError } = await supabaseAdmin
                        .from("persons")
                        .update({
                            auth_user_id: user.id,
                        })
                        .eq("id", personId);

                    if (linkError) {
                        console.error(
                            "Error vinculando persona autenticada:",
                            linkError
                        );

                        return NextResponse.json(
                            { error: "Unable to link authenticated person" },
                            { status: 500 }
                        );
                    }
                }
            }

            console.info("[checkout auth]", {
                personFound: Boolean(personId),
                personId,
            });

            if (!personId) {
                return NextResponse.json(
                    { error: "Authenticated user has no person profile" },
                    { status: 409 }
                );
            }
        }

        // =========================================================
        // SERVER-SIDE VALIDATION & MAPPING
        // =========================================================

        async function resolveDonationTypeKey(
            key: string
        ) {
            if (
                !key ||
                typeof key !== "string"
            ) {
                console.error(
                    "Invalid donation type key:",
                    key
                );

                return null;
            }

            const normalizedKey =
                key.trim().toLowerCase();

            const {
                data,
                error,
            } =
                await supabaseAdmin
                    .from("donation_types")
                    .select(
                        "id, key, active"
                    )
                    .eq(
                        "key",
                        normalizedKey
                    )
                    .eq(
                        "active",
                        true
                    )
                    .maybeSingle();

            if (error) {
                console.error(
                    "Error resolving donation type:",
                    {
                        key: normalizedKey,
                        message:
                            error.message,
                        details:
                            error.details,
                        hint:
                            error.hint,
                        code:
                            error.code,
                    }
                );

                throw new Error(
                    `Failed resolving donation type "${normalizedKey}"`
                );
            }

            if (!data) {
                console.error(
                    `Donation type "${normalizedKey}" not found`
                );

                return null;
            }

            return data.id;
        }

        const itemsToInsert: any[] = [];

        let computedTotalCents = 0;

        // =========================================================
        // DONATION ORIGIN
        // =========================================================

        if (
            origin.type === "thematic"
        ) {
            const typeKey =
                origin.donationType;

            if (
                !typeKey ||
                typeof typeKey !== "string"
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Invalid donation type key",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const typeId =
                await resolveDonationTypeKey(
                    typeKey
                );

            if (!typeId) {
                return NextResponse.json(
                    {
                        error:
                            `Donation type "${typeKey}" not found`,
                    },
                    {
                        status: 400,
                    }
                );
            }

            const amt =
                Number(amount);

            if (
                !Number.isFinite(amt) ||
                amt <= 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Invalid amount",
                    },
                    {
                        status: 400,
                    }
                );
            }

            itemsToInsert.push({
                donation_type_key:
                    typeKey,
                donation_type_id:
                    typeId,
                amount: amt,
                quantity: 1,
            });

            computedTotalCents +=
                Math.round(
                    amt * 100
                );
        }

        else if (
            origin.type === "project"
        ) {
            const projectId =
                origin.projectId;

            if (!projectId) {
                return NextResponse.json(
                    {
                        error:
                            "Missing project id",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                data: project,
                error: projErr,
            } =
                await supabaseAdmin
                    .from("projects")
                    .select(
                        "id, active, status, currency"
                    )
                    .eq(
                        "id",
                        projectId
                    )
                    .maybeSingle();

            if (
                projErr ||
                !project
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Invalid project",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (
                !project.active ||
                project.status !==
                    "active"
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Project not active",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const amt =
                Number(amount);

            if (
                !Number.isFinite(amt) ||
                amt <= 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Invalid amount",
                    },
                    {
                        status: 400,
                    }
                );
            }

            computedTotalCents +=
                Math.round(
                    amt * 100
                );
        }

        else if (
            origin.type === "free"
        ) {
            const amt =
                Number(amount);

            if (
                !Number.isFinite(amt) ||
                amt <= 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Invalid amount",
                    },
                    {
                        status: 400,
                    }
                );
            }

            computedTotalCents +=
                Math.round(
                    amt * 100
                );
        }

        else if (
            origin.type === "cart"
        ) {
            if (
                !confirmedAmounts ||
                typeof confirmedAmounts !==
                    "object"
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Invalid cart",
                    },
                    {
                        status: 400,
                    }
                );
            }

            for (
                const [key, val]
                of Object.entries(
                    confirmedAmounts
                )
            ) {
                const num =
                    Number(val);

                if (
                    !Number.isFinite(num)
                ) {
                    return NextResponse.json(
                        {
                            error:
                                `Invalid amount for ${key}`,
                        },
                        {
                            status: 400,
                        }
                    );
                }

                if (num <= 0) {
                    continue;
                }

                const typeId =
                    await resolveDonationTypeKey(
                        key
                    );

                if (!typeId) {
                    return NextResponse.json(
                        {
                            error:
                                `Invalid donation type: ${key}`,
                        },
                        {
                            status: 400,
                        }
                    );
                }

                const donationConfig =
                    donations[
                        key as keyof typeof donations
                    ];

                if (!donationConfig) {
                    return NextResponse.json(
                        {
                            error:
                                `Unknown donation type: ${key}`,
                        },
                        {
                            status: 400,
                        }
                    );
                }

                itemsToInsert.push({
                    donation_type_key:
                        key,
                    donation_type_id:
                        typeId,
                    amount: num,
                    quantity:
                        Math.floor(
                            num /
                                donationConfig.price
                        ),
                });

                computedTotalCents +=
                    Math.round(
                        num * 100
                    );
            }

            if (
                itemsToInsert.length ===
                0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Empty donation cart",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        else {
            return NextResponse.json(
                {
                    error:
                        "Invalid donation origin",
                },
                {
                    status: 400,
                }
            );
        }

        // =========================================================
        // CURRENCY
        // =========================================================

        if (
            (
                currency || ""
            ).toUpperCase() !==
            "EUR"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Unsupported currency",
                },
                {
                    status: 400,
                }
            );
        }

        // =========================================================
        // TOTAL VALIDATION
        // =========================================================

        if (
            origin.type !==
                "cart" &&
            amount !== undefined &&
            amount !== null
        ) {
            const providedCents =
                Math.round(
                    Number(amount) *
                        100
                );

            if (
                !Number.isFinite(
                    providedCents
                ) ||
                providedCents !==
                    computedTotalCents
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Amount mismatch",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // =========================================================
        // CREATE DONATION
        // =========================================================

        const donationInsert: any = {
            amount: Number(
                (
                    computedTotalCents /
                    100
                ).toFixed(2)
            ),
            currency,
            payment_method:
                "stripe",
            status:
                "pending",
            frequency:
                recurring
                    ? "monthly"
                    : "once",
            person_id:
                personId || null,
            donor_email:
                body.donor_email ??
                null,
        };

        const {
            data: donationCreated,
            error: donationError,
        } =
            await supabaseAdmin
                .from("donations")
                .insert(
                    donationInsert
                )
                .select("*")
                .single();

        if (
            donationError ||
            !donationCreated
        ) {
            console.error(
                "Failed creating donation",
                donationError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed creating donation",
                },
                {
                    status: 500,
                }
            );
        }

        const donationId =
            donationCreated.id;

        // =========================================================
        // DONATION ITEMS
        // =========================================================

        if (
            itemsToInsert.length >
            0
        ) {
            const itemsPayload =
                itemsToInsert.map(
                    (it) => ({
                        donation_id:
                            donationId,
                        donation_type_id:
                            it.donation_type_id,
                        amount:
                            it.amount,
                        quantity:
                            it.quantity,
                    })
                );

            const {
                error: itemsErr,
            } =
                await supabaseAdmin
                    .from(
                        "donation_items"
                    )
                    .insert(
                        itemsPayload
                    );

            if (itemsErr) {
                console.error(
                    "Failed inserting donation_items",
                    itemsErr
                );
            }
        }

        // =========================================================
        // PROJECT DONATION
        // =========================================================

        if (
            origin.type ===
                "project" &&
            origin.projectId
        ) {
            const proj = {
                donation_id:
                    donationId,
                project_id:
                    origin.projectId,
                amount: Number(
                    (
                        computedTotalCents /
                        100
                    ).toFixed(2)
                ),
            };

            const {
                error: projErr,
            } =
                await supabaseAdmin
                    .from(
                        "donation_projects"
                    )
                    .insert(proj);

            if (projErr) {
                console.error(
                    "Failed inserting donation_projects",
                    projErr
                );

                return NextResponse.json(
                    {
                        error:
                            "Failed creating project donation",
                    },
                    {
                        status: 500,
                    }
                );
            }
        }

        // =========================================================
        // STRIPE URLS
        // =========================================================

        const successUrl =
            process.env
                .NEXT_PUBLIC_APP_URL
                ? `${process.env.NEXT_PUBLIC_APP_URL}/donation/success?donation_id=${donationId}`
                : `${req.headers.get("origin") || ""}/donation/success?donation_id=${donationId}`;

        const cancelUrl =
            process.env
                .NEXT_PUBLIC_APP_URL
                ? `${process.env.NEXT_PUBLIC_APP_URL}/donation/cancel?donation_id=${donationId}`
                : `${req.headers.get("origin") || ""}/donation/cancel?donation_id=${donationId}`;

        // =========================================================
        // STRIPE LINE ITEMS
        // =========================================================
        //
        // Pago único:
        //   price_data sin recurring
        //
        // Mensual:
        //   price_data con recurring.month
        //

        let line_items: any[] = [];

        if (
            itemsToInsert.length >
            0
        ) {
            line_items =
                itemsToInsert.map(
                    (it) => ({
                        price_data: {
                            currency:
                                currency.toLowerCase(),

                            product_data: {
                                name:
                                    `Donación - ${it.donation_type_key}`,
                            },

                            unit_amount:
                                Math.round(
                                    Number(
                                        it.amount
                                    ) * 100
                                ),

                            ...(recurring
                                ? {
                                      recurring: {
                                          interval:
                                              "month",
                                      },
                                  }
                                : {}),
                        },

                        quantity: 1,
                    })
                );
        } else {
            line_items = [
                {
                    price_data: {
                        currency:
                            currency.toLowerCase(),

                        product_data: {
                            name:
                                "Donación",
                        },

                        unit_amount:
                            computedTotalCents,

                        ...(recurring
                            ? {
                                  recurring: {
                                      interval:
                                          "month",
                                  },
                              }
                            : {}),
                    },

                    quantity: 1,
                },
            ];
        }

        // =========================================================
        // STRIPE CHECKOUT SESSION
        // =========================================================

        const sessionParams: Stripe.Checkout.SessionCreateParams =
            {
                payment_method_types: [
                    "card",
                ],

                line_items,

                // El selector del frontend controla esta decisión.
                mode: recurring
                    ? "subscription"
                    : "payment",

                success_url:
                    successUrl,

                cancel_url:
                    cancelUrl,

                client_reference_id:
                    donationId,

                metadata: {
                    donation_id:
                        donationId,

                    frequency:
                        recurring
                            ? "monthly"
                            : "once",
                },
            };

        // =========================================================
        // STRIPE PAYMENT / SUBSCRIPTION METADATA
        // =========================================================

        if (recurring) {
            sessionParams.subscription_data =
                {
                    metadata: {
                        donation_id:
                            donationId,

                        frequency:
                            "monthly",
                    },
                };
        } else {
            sessionParams.payment_intent_data =
                {
                    metadata: {
                        donation_id:
                            donationId,

                        frequency:
                            "once",
                    },
                };
        }

        // =========================================================
        // PROJECT METADATA
        // =========================================================

        if (
            origin.type ===
                "project" &&
            origin.projectId
        ) {
            sessionParams.metadata.project_id =
                origin.projectId;
        }

        // =========================================================
        // CREATE STRIPE SESSION
        // =========================================================

        const session =
            await stripe.checkout.sessions.create(
                sessionParams
            );

        // =========================================================
        // SAVE STRIPE IDS
        // =========================================================

        const update: any = {
            stripe_checkout_session_id:
                session.id,
        };

        if (
            session.payment_intent
        ) {
            update.stripe_payment_intent_id =
                session.payment_intent;
        }

        if (
            session.subscription
        ) {
            update.stripe_subscription_id =
                session.subscription;
        }

        if (
            session.customer
        ) {
            update.stripe_customer_id =
                session.customer;
        }

        await supabaseAdmin
            .from("donations")
            .update(update)
            .eq(
                "id",
                donationId
            );

        return NextResponse.json({
            url: session.url,
        });

    } catch (err: any) {
        console.error(
            "Create checkout error",
            err
        );

        return NextResponse.json(
            {
                error: "internal",
            },
            {
                status: 500,
            }
        );
    }
}
