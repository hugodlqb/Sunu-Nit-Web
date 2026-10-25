"use client";

import "./../../styles/news.css";
import Section from "@/components/ui/Section";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { CaretLeft, CaretRight, PlusCircle } from "@phosphor-icons/react/dist/ssr";
import DetailsModal from "@/components/ui/DetailsModal";
import { AppImageFill } from "@/components/ui/AppImage";
import useLockBodyScroll from "@/components/hooks/useLockBodyScroll";
import { supabase } from "@/lib/supabase";
import type { ImageData } from "@/data/images";

interface NewsTranslation {
  id: string;
  locale: "es" | "en" | "fr";
  title: string;
  summary: string | null;
  content: string;
}

interface NewsImage {
  id: string;
  image_url: string;
  alt: string | null;
  sort_order: number;
}

interface NewsRecord {
  id: string;
  published_at: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  news_translations: NewsTranslation[] | NewsTranslation | null;
  news_images: NewsImage[] | null;
}

interface NewsItem {
  id: string;
  publishedAt: string;
  title: string;
  summary: string;
  detail: string;
  coverImage: ImageData | null;
  images: ImageData[];
}

const localeMap = {
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
} as const;

export default function News() {
  const { language, t } = useLanguage();
  const [newsRecords, setNewsRecords] = useState<NewsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const newsTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useLockBodyScroll(!!selectedNewsId);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setLoading(true);
      setLoadError(false);

      const { data, error } = await supabase
        .from("news")
        .select(`
          id,
          published_at,
          cover_image_url,
          cover_image_alt,
          news_translations (
            id,
            locale,
            title,
            summary,
            content
          ),
          news_images (
            id,
            image_url,
            alt,
            sort_order
          )
        `)
        .eq("status", "published")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Error cargando noticias:", error);
        setNewsRecords([]);
        setLoadError(true);
        setLoading(false);
        return;
      }

      setNewsRecords((data ?? []) as unknown as NewsRecord[]);
      setLoading(false);
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentNews = useMemo(() => {
    return newsRecords.flatMap((item): NewsItem[] => {
      const translations = Array.isArray(item.news_translations)
        ? item.news_translations
        : item.news_translations
          ? [item.news_translations]
          : [];
      const translation =
        translations.find((entry) => entry.locale === language) ??
        translations.find((entry) => entry.locale === "es");

      if (!translation) return [];

      const coverImage = item.cover_image_url
        ? {
            id: `news-cover-${item.id}`,
            url: item.cover_image_url,
            alt: item.cover_image_alt ?? translation.title,
          }
        : null;

      const images = (item.news_images ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => ({
          id: image.id,
          url: image.image_url,
          alt: image.alt ?? translation.title,
        }));

      return [{
        id: item.id,
        publishedAt: item.published_at,
        title: translation.title,
        summary: translation.summary ?? "",
        detail: translation.content,
        coverImage,
        images: images.length > 0 ? images : coverImage ? [coverImage] : [],
      }];
    });
  }, [newsRecords, language]);

  const selectedNews = currentNews.find(
    (item) => item.id === selectedNewsId
  ) ?? null;

  const dateLocale = localeMap[language];

  const updateCarouselControls = useCallback(() => {
    const track = newsTrackRef.current;
    if (!track) return;

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    setCanScrollPrevious(track.scrollLeft > 1);
    setCanScrollNext(maxScrollLeft - track.scrollLeft > 1);
  }, []);

  useEffect(() => {
    const track = newsTrackRef.current;
    if (!track) return;

    updateCarouselControls();
    track.addEventListener("scroll", updateCarouselControls, { passive: true });

    const resizeObserver = new ResizeObserver(updateCarouselControls);
    resizeObserver.observe(track);
    Array.from(track.children).forEach((slide) => resizeObserver.observe(slide));

    return () => {
      track.removeEventListener("scroll", updateCarouselControls);
      resizeObserver.disconnect();
    };
  }, [currentNews.length, loading, loadError, updateCarouselControls]);

  function scrollNews(direction: -1 | 1) {
    const track = newsTrackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth * 0.9,
      behavior: "smooth",
    });
  }

  return (
    <Section variant="light" id="news">
      <div className="container">
        <div className="section-header">
          <h2>{t.news_title}</h2>
          <p className="section-subtitle">{t.news_subtitle}</p>
        </div>

        {loading && <p role="status">{t.news_loading}</p>}
        {!loading && loadError && <p role="alert">{t.news_load_error}</p>}
        {!loading && !loadError && currentNews.length === 0 && (
          <p>{t.news_empty}</p>
        )}

        {!loading && !loadError && currentNews.length > 0 && (
          <div className="news-carousel">
            {(canScrollPrevious || canScrollNext) && (
              <button
                type="button"
                className="news-carousel-arrow news-carousel-arrow-prev"
                aria-label={t.news_previous}
                onClick={() => scrollNews(-1)}
                disabled={!canScrollPrevious}
              >
                <CaretLeft size={22} weight="bold" />
              </button>
            )}

          <div className="news-grid" ref={newsTrackRef}>
            {currentNews.map((item) => (
              <article
                className="news-card"
                key={item.id}
                onClick={() => setSelectedNewsId(item.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="news-image">
                  {item.coverImage && <AppImageFill image={item.coverImage} />}
                </div>

                <div className="news-content">
                  <span className="news-date">
                    {new Date(item.publishedAt).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>

                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>

                  <button
                    type="button"
                    className="btn-ver-mas"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedNewsId(item.id);
                    }}
                  >
                    <PlusCircle size={22} />
                    {t.btn_ver_mas}
                  </button>
                </div>
              </article>
            ))}
          </div>

            {(canScrollPrevious || canScrollNext) && (
              <button
                type="button"
                className="news-carousel-arrow news-carousel-arrow-next"
                aria-label={t.news_next}
                onClick={() => scrollNews(1)}
                disabled={!canScrollNext}
              >
                <CaretRight size={22} weight="bold" />
              </button>
            )}
          </div>
        )}
      </div>

      {selectedNews && (
        <DetailsModal
          card={{
            title: selectedNews.title,
            detail: selectedNews.detail,
            images: selectedNews.images,
          }}
          onClose={() => setSelectedNewsId(null)}
        />
      )}
    </Section>
  );
}