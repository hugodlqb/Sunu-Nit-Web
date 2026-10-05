"use client";

import "./../../styles/news.css";
import Section from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { news } from "@/i18n/translatNews";
import { useState } from "react";
import { PlusCircle } from "@phosphor-icons/react/dist/ssr";
import DetailsModal from "@/components/ui/DetailsModal";
import { AppImageFill } from "@/components/ui/AppImage";
import useLockBodyScroll from "@/components/hooks/useLockBodyScroll";


export default function News() {

  const { language, t } = useLanguage();

  const currentNews = news[language] ?? news.es;
  const [selectedNews, setSelectedNews] = useState<
    (typeof currentNews)[number] | null
  >(null);

  useLockBodyScroll(!!selectedNews);

  return (
    <Section variant="light" id="news">

      <div className="container">

        <div className="section-header">

          <h2>
            {t.news_title}
          </h2>

          <p className="section-subtitle">
            {t.news_subtitle}
          </p>

        </div>


        <div className="news-grid">

          {currentNews.map((item) => (

            <article
              className="news-card"
              key={item.id}
              onClick={() => setSelectedNews(item)}
              style={{ cursor: "pointer" }}
            >
              <div className="news-image">
                <AppImageFill
                  image={item.coverImage}
                />
              </div>

              <div className="news-content">

                <span className="news-date">
                  {item.date}
                </span>

                <h4>
                  {item.title}
                </h4>

                <p>
                  {item.summary}
                </p>

                <button
                  type="button"
                  className="btn-ver-mas"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNews(item);
                  }}
                >
                  <PlusCircle size={22} />
                  {t.btn_ver_mas}
                </button>

              </div>
            </article>

          ))}

        </div>

      </div>

      {selectedNews && (
        <DetailsModal
          card={{
            title: selectedNews.title,
            detail: selectedNews.detail,
            images: selectedNews.images,
          }}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </Section>
  );
}