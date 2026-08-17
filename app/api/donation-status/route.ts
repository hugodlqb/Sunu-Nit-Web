import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase-admin";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const donationId = searchParams.get("donation_id");

        if (!donationId) {
            return NextResponse.json(
                { error: "Missing donation_id" },
                { status: 400 }
            );
        }

        const { data: donation, error } = await supabaseAdmin
            .from("donations")
            .select(
                "id, status, amount, currency, payment_method, frequency, completed_at"
            )
            .eq("id", donationId)
            .maybeSingle();

        if (error) {
            console.error(
                "Failed checking donation status:",
                error
            );

            return NextResponse.json(
                { error: "Failed checking donation status" },
                { status: 500 }
            );
        }

        if (!donation) {
            return NextResponse.json(
                { error: "Donation not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: donation.id,
            status: donation.status,
            amount: donation.amount,
            currency: donation.currency,
            paymentMethod: donation.payment_method,
            frequency: donation.frequency,
            completedAt: donation.completed_at,
        });

    } catch (error) {
        console.error(
            "Donation status API error:",
            error
        );

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}