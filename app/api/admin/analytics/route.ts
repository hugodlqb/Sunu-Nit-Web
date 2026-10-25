import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 1000;

async function readAllRows<T>(table: string, columns: string): Promise<T[]> {
    const rows: T[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const { data, error } = await supabaseAdmin
            .from(table).select(columns).order("id", { ascending: true }).range(offset, offset + PAGE_SIZE - 1);
        if (error) throw new Error(`Failed reading ${table}: ${error.message}`);
        const page = (data ?? []) as T[];
        rows.push(...page);
        if (page.length < PAGE_SIZE) return rows;
    }
}

function monthKey(value: string) {
    const date = new Date(value);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(request: Request) {
    try {
        const authorization = request.headers.get("authorization") ?? "";
        if (!authorization.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(authorization.slice(7).trim());
        if (authError || !userData.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: person, error: personError } = await supabaseAdmin
            .from("persons").select("id").eq("auth_user_id", userData.user.id).maybeSingle();
        if (personError || !person) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { data: personRoles, error: roleError } = await supabaseAdmin
            .from("person_roles").select("roles(key)").eq("person_id", person.id);
        if (roleError) throw new Error("Unable to verify administrator role");
        const isAdmin = (personRoles ?? []).some((item: any) => {
            const role = Array.isArray(item.roles) ? item.roles[0] : item.roles;
            return role?.key === "admin";
        });
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const url = new URL(request.url);
        const startDateParam = url.searchParams.get("startDate");
        const endDateParam = url.searchParams.get("endDate");
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const today = new Date();
        const defaultEnd = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const defaultStart = new Date(defaultEnd);
        defaultStart.setUTCFullYear(defaultStart.getUTCFullYear() - 1);
        const startDate = startDateParam && datePattern.test(startDateParam)
            ? new Date(`${startDateParam}T00:00:00.000Z`) : defaultStart;
        const endDate = endDateParam && datePattern.test(endDateParam)
            ? new Date(`${endDateParam}T00:00:00.000Z`) : defaultEnd;
        if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) ||
            startDate.toISOString().slice(0, 10) !== (startDateParam || startDate.toISOString().slice(0, 10)) ||
            endDate.toISOString().slice(0, 10) !== (endDateParam || endDate.toISOString().slice(0, 10)) ||
            startDate > endDate || endDate > defaultEnd) {
            return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
        }
        const endExclusive = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
        const monthKeys: string[] = [];
        const cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
        const lastMonth = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));
        while (cursor <= lastMonth) {
            monthKeys.push(monthKey(cursor.toISOString()));
            cursor.setUTCMonth(cursor.getUTCMonth() + 1);
        }
        const isInRange = (value: string | null | undefined) => {
            if (!value) return false;
            const time = new Date(value).getTime();
            return time >= startDate.getTime() && time < endExclusive.getTime();
        };
        const months = new Map(monthKeys.map((key) => [key, {
            month: key, revenue: 0, newDonors: 0, newUsers: 0, payments: 0,
        }]));

        const [people, donations, payments] = await Promise.all([
            readAllRows<{ id: string; created_at: string }>("persons", "id, created_at"),
            readAllRows<{
                id: string; amount: number; currency: string; status: string;
                created_at: string; completed_at: string | null;
                person_id: string | null; donor_email: string | null;
            }>("donations", "id, amount, currency, status, created_at, completed_at, person_id, donor_email"),
            readAllRows<{
                id: string; amount: number; status: string; created_at: string; donation_id: string;
            }>("donation_payments", "id, amount, status, created_at, donation_id"),
        ]);

        for (const user of people) {
            if (!user.created_at) continue;
            if (!isInRange(user.created_at)) continue;
            const month = months.get(monthKey(user.created_at));
            if (month) month.newUsers += 1;
        }

        const donationsById = new Map(donations.map((donation) => [donation.id, donation]));
        const successfulPayments = payments.filter((payment) =>
            ["succeeded", "completed"].includes(payment.status)
        );
        const firstPaymentByDonor = new Map<string, string>();

        for (const payment of successfulPayments) {
            const donation = donationsById.get(payment.donation_id);
            if (!donation) continue;
            const email = donation.donor_email?.trim().toLowerCase();
            const donorKey = donation.person_id
                ? `person:${donation.person_id}`
                : email ? `email:${email}` : null;

            if (donorKey) {
                const previous = firstPaymentByDonor.get(donorKey);
                if (!previous || new Date(payment.created_at).getTime() < new Date(previous).getTime()) {
                    firstPaymentByDonor.set(donorKey, payment.created_at);
                }
            }

            if (isInRange(payment.created_at)) {
                const month = months.get(monthKey(payment.created_at));
                if (month) {
                    month.revenue += Number(payment.amount) || 0;
                    month.payments += 1;
                }
            }
        }

        for (const firstDate of firstPaymentByDonor.values()) {
            if (!isInRange(firstDate)) continue;
            const month = months.get(monthKey(firstDate));
            if (month) month.newDonors += 1;
        }

        const monthly = [...months.values()];
        const currencies = new Set(
            successfulPayments
                .filter((payment) => isInRange(payment.created_at))
                .map((payment) => donationsById.get(payment.donation_id)?.currency || "EUR")
        );

        return NextResponse.json({
            totalUsers: people.length,
            newUsers: monthly.reduce((sum, month) => sum + month.newUsers, 0),
            newDonors: monthly.reduce((sum, month) => sum + month.newDonors, 0),
            revenue: monthly.reduce((sum, month) => sum + month.revenue, 0),
            payments: monthly.reduce((sum, month) => sum + month.payments, 0),
            months: monthly,
            currency: currencies.size === 1 ? [...currencies][0] : "EUR",
            campaignTrackingEnabled: false,
        }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Admin analytics error:", error);
        return NextResponse.json({ error: "Unable to load administration analytics" }, { status: 500 });
    }
}
