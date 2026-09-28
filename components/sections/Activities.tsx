"use client";

import "@/styles/activities.css";
import ProjectDonationCards from "@/components/ui/Collaborate/ProjectDonationCards";
import Section from "@/components/ui/Section";
import ActivityModal from "@/components/ui/ActivityModal";
import useLockBodyScroll from "@/components/hooks/useLockBodyScroll";
import { activities } from "@/data/activities";
import ProjectModal from "@/components/ui/ProjectModal";
import {
  activityTranslations,
  type ActivityLanguage
} from "@/i18n/translatActivities";

import { useLanguage } from "@/context/LanguageContext";

import { useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { CaretRight } from "@phosphor-icons/react";

import { AppImageFill } from "@/components/ui/AppImage";


export default function Activities() {


  const { language, t } = useLanguage();


  const currentActivities =
    activities[language as ActivityLanguage] ??
    activities.es;



  const lang =
    activityTranslations[language as ActivityLanguage] ??
    activityTranslations.es;



  const [selectedActivity, setSelectedActivity] =
    useState<(typeof currentActivities)[number] | null>(null);

  const [selectedProjectId, setSelectedProjectId] =
    useState<string | null>(null);

    useLockBodyScroll(
    !!selectedActivity ||
    !!selectedProjectId
);

  return (

    <Section
      id="activities"
      variant="white"
    >


      <div className="container">


        <div className="section-header">


          <h2>
            {t.activities_title}
          </h2>


          <p className="section-subtitle">
            {t.activities_subtitle}
          </p>


        </div>



        <Swiper

          modules={[Navigation]}

          navigation

          loop={true}

          spaceBetween={24}

          slidesPerView={3}


          breakpoints={{

            0: {
              slidesPerView: 1,
            },

            768: {
              slidesPerView: 2,
            },

            1100: {
              slidesPerView: 3,
            }

          }}

        >



          {currentActivities.map((activity) => (


            <SwiperSlide
              key={activity.id}
            >


              <article

                className="activity-card"

                onClick={() =>
                  setSelectedActivity(activity)
                }

              >


                <div className="activity-image">


                  <AppImageFill
                    image={activity.coverImage}
                  />


                </div>



                <div className={`activity-info activity-${activity.id}`}>


                  <h3>
                    {lang[activity.titleKey]}
                  </h3>



                  <button

                    className="activity-btn"

                    onClick={(e) => {

                      e.stopPropagation();

                      setSelectedActivity(activity);

                    }}

                  >

                    <span>
                      {t.btn_saber_mas}
                    </span>


                    <CaretRight

                      size={18}

                      weight="bold"

                    />


                  </button>


                </div>


              </article>


            </SwiperSlide>


          ))}



        </Swiper>
        <div className="projects-main-section">

          <div className="section-header">
            <h2>
              Proyectos
            </h2>

            <p className="section-subtitle">
              Conoce los proyectos que estamos impulsando.
            </p>
          </div>

          <ProjectDonationCards
            onDetails={(projectId) =>
              setSelectedProjectId(projectId)
            }
          />

        </div>


      </div>




      {selectedActivity && (



        <ActivityModal


          activity={{


            title:
              lang[selectedActivity.titleKey],



            summary:
              lang[selectedActivity.summaryKey],



            category:
              lang[selectedActivity.categoryKey],



            updates:
              selectedActivity.updates ?? [],


          }}



          onClose={() => setSelectedActivity(null)}



        />



      )}

      {selectedProjectId && (
        <ProjectModal
          projectId={selectedProjectId}
          onClose={() =>
            setSelectedProjectId(null)
          }
        />
      )}

    </Section>

  );


}