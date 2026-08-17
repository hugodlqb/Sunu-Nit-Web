"use client";

import { useState } from "react";
import { Handshake } from "@phosphor-icons/react/dist/ssr";
import { donations } from "@/data/donations";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
    onClose: () => void;
    helpSummary: any[];
    totalMonthly: number;
    isMonthly: boolean;
    setIsMonthly: (value: boolean) => void;
    removeFromHelp: (type: keyof typeof donations) => void;
    addToHelp: (type: keyof typeof donations, value: number) => void;
    deleteConfirmation: keyof typeof donations | null;
    setDeleteConfirmation: (value: keyof typeof donations | null) => void;
    confirmDeleteHelp: () => void;
    onContinue: () => Promise<void> | void;
}

export default function HelpPanel({
    onClose,
    helpSummary,
    totalMonthly,
    isMonthly,
    setIsMonthly,
    removeFromHelp,
    addToHelp,
    deleteConfirmation,
    setDeleteConfirmation,
    confirmDeleteHelp,
    onContinue,
}: Props) {
    const { t } = useLanguage();
    const iconMap: Record<string, string> = {
        food: "🍽️",
        hygiene: "🧼",
        health: "💊",
    };
    const [loading, setLoading] = useState(false);

    async function handleContinue() {
        if (loading) return;
        setLoading(true);
        try {
            await onContinue();
        } catch (e) {
            console.error(e);
            alert(t.help_continue_error || "Error iniciando el pago");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="help-overlay" onClick={onClose}>
            <div className="help-panel" onClick={(e) => e.stopPropagation()}>
                <h2>🤝 {t.help_title}</h2>
                <p className="help-panel-subtitle">{t.help_subtitle}</p>

                <div className="help-achievements">
                    {helpSummary.map((item) => (
                        <div key={item.id} className="help-achievement">

                            <button
                                type="button"
                                className="help-quantity-btn"
                                onClick={() => removeFromHelp(item.id)}
                            >
                                −
                            </button>

                            <div className="help-impact-content">

                                <div className="help-impact-main">
                                    <span className="help-impact-icon">
                                        {iconMap[item.id] ?? "🎁"}
                                    </span>

                                    <strong>
                                        {item.quantity} {item.unit}
                                    </strong>
                                </div>

                                <div className="help-impact-equivalent">
                                    {item.quantity} × {donations[item.id].price} € →{" "}
                                    <strong>
                                        {item.quantity * donations[item.id].price} €
                                    </strong>
                                </div>

                            </div>

                            <button
                                type="button"
                                className="help-quantity-btn"
                                onClick={() =>
                                    addToHelp(
                                        item.id,
                                        donations[item.id].price
                                    )
                                }
                            >
                                +
                            </button>

                        </div>
                    ))}
                </div>

                <hr className="help-divider" />

                <div className="help-total">
                    <span>
                        {isMonthly
                            ? t.help_total_monthly
                            : "Total de tu donación"}
                    </span>

                    <strong>
                        {totalMonthly} €
                    </strong>
                </div>

                <div className="help-frequency">
                    <span className={`toggle-label ${!isMonthly ? "active" : ""}`}>{t.toggle_once}</span>
                    <label className="switch">
                        <input type="checkbox" checked={isMonthly} onChange={(e) => setIsMonthly(e.target.checked)} />
                        <span className="slider round"></span>
                    </label>
                    <span className={`toggle-label ${isMonthly ? "active" : ""}`}>{t.toggle_monthly}</span>
                </div>

                {deleteConfirmation && (
                    <div className="delete-confirm-overlay">
                        <div className="delete-confirm-card">
                            <h3>{t.help_delete_title}</h3>
                            <p>{t.help_delete_text}</p>
                            <div className="delete-confirm-actions">
                                <button className="btn btn-outline" onClick={() => setDeleteConfirmation(null)}>
                                    {t.cancel}
                                </button>
                                <button className="btn btn-primary" onClick={confirmDeleteHelp}>
                                    {t.deleter}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    className="btn btn-primary help-continue-btn"
                    onClick={handleContinue}
                    disabled={loading || helpSummary.length === 0}
                >
                    <Handshake size={28} weight="fill" />
                    {loading ? t.processing_payment : t.help_continue}
                </button>
            </div>
        </div>
    );
}