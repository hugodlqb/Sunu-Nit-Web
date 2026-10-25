"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import {
    MagnifyingGlass, UsersThree, CurrencyEur, UserPlus, ChartLineUp,
    ShieldCheck, FloppyDisk, X,
} from "@phosphor-icons/react/dist/ssr";
import {
    Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip,
    XAxis, YAxis, Line, LineChart,
} from "recharts";

interface Person {
    id: string;
    name: string | null;
    surname: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
}
interface Role { id: string; key: string; }
interface MonthMetric {
    month: string;
    revenue: number;
    newDonors: number;
    newUsers: number;
    payments: number;
}
interface Analytics {
    totalUsers: number;
    newUsers: number;
    newDonors: number;
    revenue: number;
    payments: number;
    months: MonthMetric[];
    currency: string;
}
type AdminTab = "overview" | "users";

function dateInputValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getDefaultDateRange() {
    const end = new Date();
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);
    return { start: dateInputValue(start), end: dateInputValue(end) };
}

export default function AccountAdmin() {
    const { t, language } = useLanguage();
    const { profile } = useAuth();
    const roleLabels: Record<string, string> = {
        admin: t.role_admin,
        editor: t.role_editor,
        volunteer: t.role_volunteer,
        volunteer_manager: t.role_volunteer_manager,
    };
    const [tab, setTab] = useState<AdminTab>("overview");
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<Person[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [originalRoles, setOriginalRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPerson, setLoadingPerson] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [saveMessage, setSaveMessage] = useState("");
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [analyticsError, setAnalyticsError] = useState("");
    const [initialDateRange] = useState(getDefaultDateRange);
    const [startDate, setStartDate] = useState(initialDateRange.start);
    const [endDate, setEndDate] = useState(initialDateRange.end);
    const [appliedStartDate, setAppliedStartDate] = useState(initialDateRange.start);
    const [appliedEndDate, setAppliedEndDate] = useState(initialDateRange.end);

    const loadAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        setAnalyticsError("");
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) throw new Error("No active session");
            const params = new URLSearchParams({ startDate: appliedStartDate, endDate: appliedEndDate });
            const response = await fetch(`/api/admin/analytics?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });
            const json = await response.json();
            if (!response.ok) throw new Error(json.error || "Analytics unavailable");
            setAnalytics(json as Analytics);
        } catch (error) {
            console.error("Error loading admin analytics:", error);
            setAnalyticsError(t.admin_analytics_error);
        } finally {
            setAnalyticsLoading(false);
        }
    }, [t.admin_analytics_error, appliedStartDate, appliedEndDate]);

    useEffect(() => { void loadAnalytics(); }, [loadAnalytics]);

    async function searchUsers(event?: FormEvent) {
        event?.preventDefault();
        const value = search.trim();
        if (!value) {
            setResults([]);
            setSearchError(t.admin_search_empty);
            return;
        }
        setLoading(true);
        setSearchError("");
        setSelectedPerson(null);
        setSaveMessage("");
        // Separate column queries keep names and email punctuation from breaking PostgREST's OR syntax.
        const columns = "id, name, surname, email, phone, country";
        const [byName, bySurname, byEmail] = await Promise.all([
            supabase.from("persons").select(columns).ilike("name", `%${value}%`).limit(30),
            supabase.from("persons").select(columns).ilike("surname", `%${value}%`).limit(30),
            supabase.from("persons").select(columns).ilike("email", `%${value}%`).limit(30),
        ]);
        const error = byName.error || bySurname.error || byEmail.error;
        if (error) {
            console.error("Error buscando usuarios:", error);
            setResults([]);
            setSearchError(t.admin_search_error);
        } else {
            const unique = new Map<string, Person>();
            [...(byName.data ?? []), ...(bySurname.data ?? []), ...(byEmail.data ?? [])]
                .forEach((person) => unique.set(person.id, person as Person));
            const found = [...unique.values()]
                .sort((a, b) => `${a.name ?? ""} ${a.surname ?? ""}`.localeCompare(`${b.name ?? ""} ${b.surname ?? ""}`))
                .slice(0, 30);
            setResults(found);
            if (!found.length) setSearchError(t.admin_no_users);
        }
        setLoading(false);
    }

    async function selectPerson(person: Person) {
        setSelectedPerson(person);
        setLoadingPerson(true);
        setSaveMessage("");
        const { data: allRoles, error: rolesError } = await supabase
            .from("roles").select("id, key").order("key");
        if (rolesError) {
            console.error("Error cargando roles:", rolesError);
            setSaveMessage(t.admin_roles_load_error);
            setLoadingPerson(false);
            return;
        }
        const { data: personRoles, error: personRolesError } = await supabase
            .from("person_roles").select("role_id").eq("person_id", person.id);
        if (personRolesError) {
            console.error("Error cargando roles del usuario:", personRolesError);
            setSaveMessage(t.admin_roles_load_error);
            setLoadingPerson(false);
            return;
        }
        const roleIds = personRoles?.map((role) => role.role_id) ?? [];
        setRoles((allRoles ?? []) as Role[]);
        setSelectedRoles(roleIds);
        setOriginalRoles(roleIds);
        setLoadingPerson(false);
    }

    function toggleRole(roleId: string) {
        setSelectedRoles((current) => current.includes(roleId)
            ? current.filter((id) => id !== roleId)
            : [...current, roleId]);
        setSaveMessage("");
    }

    async function saveRoles() {
        if (!selectedPerson) return;
        setSaving(true);
        setSaveMessage("");
        const rolesToDelete = originalRoles.filter((id) => !selectedRoles.includes(id));
        const rolesToInsert = selectedRoles.filter((id) => !originalRoles.includes(id));
        if (rolesToDelete.length) {
            const { error } = await supabase.from("person_roles")
                .delete().eq("person_id", selectedPerson.id).in("role_id", rolesToDelete);
            if (error) {
                console.error("Error eliminando roles:", error);
                setSaveMessage(t.admin_roles_save_error);
                setSaving(false);
                return;
            }
        }
        if (rolesToInsert.length) {
            const { error } = await supabase.from("person_roles").insert(
                rolesToInsert.map((roleId) => ({ person_id: selectedPerson.id, role_id: roleId }))
            );
            if (error) {
                console.error("Error añadiendo roles:", error);
                setSaveMessage(t.admin_roles_save_error);
                setSaving(false);
                return;
            }
        }
        setOriginalRoles(selectedRoles);
        setSaveMessage(t.admin_roles_saved);
        setSaving(false);
    }

    const formattedRevenue = useMemo(() => new Intl.NumberFormat(
        language === "fr" ? "fr-FR" : language === "en" ? "en-GB" : "es-ES",
        { style: "currency", currency: analytics?.currency || "EUR", maximumFractionDigits: 0 }
    ).format(analytics?.revenue ?? 0), [analytics, language]);

    const formatMonth = (month: string) => new Date(`${month}-01T12:00:00`).toLocaleDateString(
        language === "fr" ? "fr-FR" : language === "en" ? "en-GB" : "es-ES",
        { month: "short" }
    );
    const hasUnsavedChanges = selectedRoles.length !== originalRoles.length ||
        selectedRoles.some((id) => !originalRoles.includes(id));

    return (
        <section className="admin-dashboard">
            <nav className="admin-tabs" aria-label={t.admin_sections}>
                <button type="button" className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><ChartLineUp size={19} />{t.admin_overview}</button>
                <button type="button" className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}><UsersThree size={19} />{t.admin_users}</button>
            </nav>

            {tab === "overview" ? (
                <div className="admin-overview">
                    {analyticsError && <div className="admin-state admin-state-error" role="alert"><span>{analyticsError}</span><button type="button" onClick={() => void loadAnalytics()}>{t.admin_retry}</button></div>}
<form className="admin-date-filter" onSubmit={(event) => { event.preventDefault(); setAppliedStartDate(startDate); setAppliedEndDate(endDate); }}>
                        <label>{t.admin_date_from}<input type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} required /></label>
                        <label>{t.admin_date_to}<input type="date" value={endDate} min={startDate || undefined} max={dateInputValue(new Date())} onChange={(event) => setEndDate(event.target.value)} required /></label>
                        <button type="submit" disabled={analyticsLoading || !startDate || !endDate || startDate > endDate}>{t.admin_apply_dates}</button>
                    </form>
                    <div className="admin-metrics-grid">
                        <article className="admin-metric-card"><span className="admin-metric-icon"><CurrencyEur size={22} /></span><span className="admin-metric-label">{t.admin_revenue_12m}</span><strong>{analyticsLoading ? "—" : formattedRevenue}</strong><small>{t.admin_revenue_caption}</small></article>
                        <article className="admin-metric-card"><span className="admin-metric-icon"><UserPlus size={22} /></span><span className="admin-metric-label">{t.admin_new_donors_12m}</span><strong>{analyticsLoading ? "—" : analytics?.newDonors ?? 0}</strong><small>{t.admin_new_donors_caption}</small></article>
                        <article className="admin-metric-card"><span className="admin-metric-icon"><UsersThree size={22} /></span><span className="admin-metric-label">{t.admin_new_users_12m}</span><strong>{analyticsLoading ? "—" : analytics?.newUsers ?? 0}</strong><small>{t.admin_total_users}: {analyticsLoading ? "—" : analytics?.totalUsers ?? 0}</small></article>
                        <article className="admin-metric-card"><span className="admin-metric-icon"><ShieldCheck size={22} /></span><span className="admin-metric-label">{t.admin_payments_12m}</span><strong>{analyticsLoading ? "—" : analytics?.payments ?? 0}</strong><small>{t.admin_payments_caption}</small></article>
                    </div>

                    <div className="admin-chart-grid">
                        <article className="admin-chart-card">
                            <div className="admin-card-heading"><div><h3>{t.admin_donation_trend}</h3><p>{t.admin_last_12_months}</p></div></div>
                            {analyticsLoading ? <div className="admin-chart-empty">{t.admin_loading}</div> : (
                                <div className="admin-chart"><ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics?.months ?? []} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                                        <defs><linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3c8066" stopOpacity={0.28} /><stop offset="95%" stopColor="#3c8066" stopOpacity={0.02} /></linearGradient></defs>
                                        <CartesianGrid stroke="#e8eee9" strokeDasharray="4 4" vertical={false} />
                                        <XAxis dataKey="month" tickFormatter={formatMonth} tickLine={false} axisLine={false} tick={{ fill: "#75847b", fontSize: 12 }} />
                                        <YAxis tickLine={false} axisLine={false} width={48} tick={{ fill: "#75847b", fontSize: 12 }} />
                                        <Tooltip formatter={(value) => [new Intl.NumberFormat(language === "fr" ? "fr-FR" : language === "en" ? "en-GB" : "es-ES", { style: "currency", currency: analytics?.currency || "EUR", maximumFractionDigits: 0 }).format(Number(value)), t.admin_revenue_label]} />
                                        <Area type="monotone" dataKey="revenue" stroke="#34765b" strokeWidth={2.5} fill="url(#adminRevenueFill)" activeDot={{ r: 5 }} />
                                    </AreaChart>
                                </ResponsiveContainer></div>
                            )}
                        </article>
                        <article className="admin-chart-card">
                            <div className="admin-card-heading"><div><h3>{t.admin_growth_trend}</h3><p>{t.admin_last_12_months}</p></div></div>
                            {analyticsLoading ? <div className="admin-chart-empty">{t.admin_loading}</div> : (
                                <div className="admin-chart"><ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics?.months ?? []} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                                        <CartesianGrid stroke="#e8eee9" strokeDasharray="4 4" vertical={false} />
                                        <XAxis dataKey="month" tickFormatter={formatMonth} tickLine={false} axisLine={false} tick={{ fill: "#75847b", fontSize: 12 }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#75847b", fontSize: 12 }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="newDonors" name={t.admin_new_donors_short} stroke="#34765b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                                        <Line type="monotone" dataKey="newUsers" name={t.admin_new_users_short} stroke="#d49a4a" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer></div>
                            )}
                            <div className="admin-chart-legend"><span><i className="donor" />{t.admin_new_donors_short}</span><span><i className="user" />{t.admin_new_users_short}</span></div>
                        </article>
                    </div>

                    <p className="admin-data-note">{t.admin_analytics_note}</p>
                </div>
            ) : (
                <div className="admin-users-view">
                    <div className="admin-users-heading"><div><h3>{t.admin_users_title}</h3><p>{t.admin_users_description}</p></div></div>
                    <form className="admin-search-form" onSubmit={searchUsers}>
                        <MagnifyingGlass size={21} />
                        <input type="search" placeholder={t.admin_search_placeholder} value={search} onChange={(event) => setSearch(event.target.value)} aria-label={t.admin_search_placeholder} />
                        {search && <button type="button" className="admin-clear-search" onClick={() => { setSearch(""); setResults([]); setSearchError(""); }} aria-label={t.admin_clear_search}><X size={18} /></button>}
                        <button className="admin-search-submit" type="submit" disabled={loading}>{loading ? t.admin_searching : t.admin_search_button}</button>
                    </form>
                    <div className="admin-user-layout">
                        <section className="admin-results-card">
                            <div className="admin-results-heading"><strong>{t.admin_search_results}</strong><span>{results.length}</span></div>
                            {loading ? <div className="admin-empty-state">{t.admin_searching}</div> : results.length ? (
                                <div className="admin-user-results">{results.map((person) => {
                                    const fullName = [person.name, person.surname].filter(Boolean).join(" ") || t.admin_unnamed_user;
                                    return <button type="button" key={person.id} className={selectedPerson?.id === person.id ? "admin-user-result selected" : "admin-user-result"} onClick={() => void selectPerson(person)}>
                                        <span className="admin-avatar">{(person.name?.[0] || person.email?.[0] || "?").toUpperCase()}</span>
                                        <span className="admin-user-result-copy"><strong>{fullName}</strong><small>{person.email || person.phone || t.admin_no_contact}</small></span><span className="admin-result-arrow">›</span>
                                    </button>;
                                })}</div>
                            ) : <div className="admin-empty-state"><MagnifyingGlass size={25} /><p>{searchError || t.admin_search_prompt}</p></div>}
                            {results.length === 30 && <p className="admin-results-limit">{t.admin_results_limit}</p>}
                        </section>
                        <section className="admin-user-detail-card">
                            {!selectedPerson ? <div className="admin-detail-placeholder"><span><UsersThree size={28} /></span><h3>{t.admin_select_user}</h3><p>{t.admin_select_user_hint}</p></div> : <>
                                <div className="admin-selected-user"><span className="admin-avatar admin-avatar-large">{(selectedPerson.name?.[0] || selectedPerson.email?.[0] || "?").toUpperCase()}</span><div><h3>{[selectedPerson.name, selectedPerson.surname].filter(Boolean).join(" ") || t.admin_unnamed_user}</h3><p>{selectedPerson.email || t.admin_no_email}</p></div></div>
                                <div className="admin-person-facts"><div><span>{t.admin_phone}</span><strong>{selectedPerson.phone || "—"}</strong></div><div><span>{t.admin_country}</span><strong>{selectedPerson.country || "—"}</strong></div></div>
                                <div className="admin-role-heading"><h4>{t.admin_roles}</h4><p>{t.admin_roles_hint}</p></div>
                                {loadingPerson ? <p className="admin-muted">{t.admin_loading}</p> : <div className="admin-role-list">{roles.filter((role) => !(role.key === "admin" && selectedPerson.id === profile?.id)).map((role) => (
                                    <label key={role.id} className={selectedRoles.includes(role.id) ? "admin-role-option checked" : "admin-role-option"}>
                                        <input type="checkbox" checked={selectedRoles.includes(role.id)} onChange={() => toggleRole(role.id)} /><span className="admin-role-check" /><span>{roleLabels[role.key] ?? role.key}</span>
                                    </label>
                                ))}</div>}
                                <div className="admin-save-row">
                                    {saveMessage && <p className={saveMessage === t.admin_roles_saved ? "admin-inline-message success" : "admin-inline-message error"} role="status">{saveMessage}</p>}
                                    <button type="button" className="admin-save-button" onClick={() => void saveRoles()} disabled={saving || loadingPerson || !hasUnsavedChanges}><FloppyDisk size={18} />{saving ? t.admin_saving_roles : t.admin_save_roles}</button>
                                </div>
                            </>}
                        </section>
                    </div>
                </div>
            )}
        </section>
    );
}
