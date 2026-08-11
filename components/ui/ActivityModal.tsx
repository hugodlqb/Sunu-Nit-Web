"use client";

import { X } from "@phosphor-icons/react";

import "@/styles/detailsmodal.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { ImageData } from "@/data/images";

import { AppImageFill } from "@/components/ui/AppImage";


interface ActivityUpdate {

    id: string;

    date: string;

    title: string;

    text: string;

    images: ImageData[];

}



interface ActivityModalProps {

    activity: {

        title: string;

        summary: string;

        category: string;

        updates: ActivityUpdate[];

    };

    onClose: () => void;

}



export default function ActivityModal({

    activity,

    onClose,

}: ActivityModalProps) {


    return (

        <div
            className="activity-modal-overlay"
            onClick={onClose}
        >


            <div

                className="activity-modal"

                onClick={(e) => e.stopPropagation()}

            >


                <button

                    className="activity-close"

                    onClick={onClose}

                >

                    <X size={24} />

                </button>



                <div className="activity-content">
                    <div className="activity-header">
                        <span className="activity-category">
                            {activity.category}
                        </span>

                        <h2>
                            {activity.title}
                        </h2>

                        <p className="activity-summary">
                            {activity.summary}
                        </p>
                    </div>

                    <div className="activity-updates">
                        {activity.updates.map((update, index) => (
                            <article
                                className={`activity-update ${index % 2 === 0
                                    ? "update-beige"
                                    : "update-light"
                                    }`}
                                key={update.id}
                            >
                                <span className="activity-date">
                                    {update.date}
                                </span>

                                <h3>
                                    {update.title}
                                </h3>

                                <p>
                                    {update.text}
                                </p>

                                {update.images.length > 0 && (
                                    <Swiper
                                        className="activity-swiper"
                                        modules={[
                                            Navigation,
                                            Pagination
                                        ]}
                                        navigation
                                        pagination={{
                                            clickable: true
                                        }}
                                        spaceBetween={20}
                                        slidesPerView={1}
                                        loop
                                    >



                                        {update.images.map((image) => (


                                            <SwiperSlide

                                                key={image.id}

                                            >


                                                <div className="activity-update-image">


                                                    <AppImageFill

                                                        image={image}

                                                    />


                                                </div>


                                            </SwiperSlide>


                                        ))}



                                    </Swiper>


                                )}



                            </article>


                        ))}



                    </div>



                </div>



            </div>


        </div>

    );

}