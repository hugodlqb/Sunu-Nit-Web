"use client";

import "@/styles/impact.css";
import Section from "@/components/ui/Section";
import { BowlFood, FirstAid, Drop, PlusCircle } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import DetailsModal from "@/components/ui/DetailsModal";
import { useLanguage } from "@/context/LanguageContext";
import { images } from "@/data/images";
import { galleries } from "@/data/galleries";


const cards = [
  {
    titleKey: "impact_food_title",
    descriptionKey: "desc_base_food",
    detailKey: "progress_food_desc",
    coverImage: images.impactFood,
    images: galleries.impactFood,
    icon: BowlFood,
    color: "var(--color-accent)",
  },

  {
    titleKey: "impact_health_title",
    descriptionKey: "desc_base_health",
    detailKey: "progress_health_desc",
    coverImage: images.impactHealth,
    images: galleries.impactHealth,
    icon: FirstAid,
    color: "var(--color-secondary)",
  },

  {
    titleKey: "impact_space_hygiene",
    descriptionKey: "desc_base_hygiene",
    detailKey: "progress_space_desc",
    coverImage: images.impactHygiene,
    images: galleries.impactHygiene,
    icon: Drop,
    color: "var(--color-primary)",
  },
];

export default function Impact() {
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const { t } = useLanguage();

  return (
    <Section id="impact" variant="light">
      <div className="container">

        <div className="section-header">

          <h2>{t.money_usage_title}</h2>

          <p className="section-subtitle">
            {t.money_usage_subtitle}
          </p>

        </div>

        <div className="grid-3">

          {cards.map((card) => {

            const Icon = card.icon;

            return (
              <article
                key={card.titleKey}
                className="cloud-card"
                style={{
                  backgroundImage: `url(${card.coverImage.url})`,
                }}
              >
                <div className="cloud-content">

                  <div className="cloud-title-wrapper">

                    <div className="cloud-icon">

                      <Icon
                        size={32}
                        weight="fill"
                        style={{ color: card.color }}
                      />

                    </div>

                    <h4>{t[card.titleKey]}</h4>

                  </div>

                  <p className="cloud-desc">
                    {t[card.descriptionKey]}
                  </p>

                  <button
                    className="btn-ver-mas"
                    onClick={() => setSelectedCard(card)}
                  >
                    <PlusCircle size={22} />
                    {t.btn_ver_mas}
                  </button>

                </div>

              </article>
            );
          })}

        </div>

      </div>

      {selectedCard && (
        <DetailsModal
          card={{
            images: selectedCard.images,
            title: t[selectedCard.titleKey],
            detail: t[selectedCard.detailKey],
          }}
          onClose={() => setSelectedCard(null)}
        />
      )}

    </Section>
  );
}