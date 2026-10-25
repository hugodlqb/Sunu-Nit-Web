"use client";

import { useState } from "react";
import { Bank, CheckCircle, Copy, DeviceMobile } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";
import { donationConfig } from "@/lib/donation-config";

type CopyTarget = "iban" | "reference";

export default function PaymentMethods() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [copyError, setCopyError] = useState(false);
  const hasIban = Boolean(donationConfig.iban);
  const reference = t.collab_transfer_reference_value;
  const displayIban = donationConfig.iban.replace(/(.{4})/g, "$1 ").trim();

  async function copyValue(value: string, target: CopyTarget) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
      setCopyError(false);
    } catch {
      setCopied(null);
      setCopyError(true);
    }
  }

  return (
    <div className="collaborate-grid grid-2 container-sm">
      <div className="collab-card highlighted-card">
        <div className="collab-badge-wrapper"><div className="collab-badge">{t.collab_badge_fast}</div></div>
        <DeviceMobile size={45} />
        <h3>{t.collab_bizum_title}</h3>
        <div className="bizum-number">
          <span>+34 608 70 97 10</span>
          <button className="btn-copy" title={t.copied} type="button"><Copy size={28} /></button>
        </div>
        <p className="small-text text-muted">{t.collab_bizum_desc}</p>
      </div>

      <div className="collab-card collab-transfer-card">
        <Bank size={45} />
        <h3>{t.collab_transfer_title}</h3>
        <p className="collab-transfer-desc">{t.collab_transfer_desc}</p>
        <div className="collab-transfer-details">
          <div className="collab-transfer-field">
            <span className="collab-transfer-label">{t.collab_transfer_holder}</span>
            <strong>ASOCIACIÓN SUNU NIT</strong>
          </div>
          {donationConfig.bankName && (
            <div className="collab-transfer-field">
              <span className="collab-transfer-label">{t.collab_transfer_bank}</span>
              <strong>{donationConfig.bankName}</strong>
            </div>
          )}
          <div className="collab-transfer-field">
            <span className="collab-transfer-label">{t.collab_transfer_iban}</span>
            {hasIban ? (
              <div className="collab-transfer-copy-row">
                <code className="collab-transfer-iban">{displayIban}</code>
                <button className="collab-transfer-copy" type="button" onClick={() => copyValue(donationConfig.iban, "iban")} aria-label={t.collab_transfer_copy_iban} title={t.collab_transfer_copy_iban}>
                  {copied === "iban" ? <CheckCircle size={22} /> : <Copy size={22} />}
                </button>
              </div>
            ) : <p className="collab-transfer-pending">{t.collab_transfer_pending}</p>}
          </div>
          <div className="collab-transfer-field">
            <span className="collab-transfer-label">{t.collab_transfer_reference}</span>
            <div className="collab-transfer-copy-row">
              <strong>{reference}</strong>
              <button className="collab-transfer-copy" type="button" onClick={() => copyValue(reference, "reference")} aria-label={t.collab_transfer_copy_reference} title={t.collab_transfer_copy_reference}>
                {copied === "reference" ? <CheckCircle size={22} /> : <Copy size={22} />}
              </button>
            </div>
          </div>
        </div>
        <p className="collab-transfer-feedback" aria-live="polite">
          {copyError ? t.collab_transfer_copy_error : copied ? t.copied : !hasIban ? t.collab_transfer_pending : ""}
        </p>
      </div>
    </div>
  );
}
