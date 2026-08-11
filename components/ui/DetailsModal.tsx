import { X } from "@phosphor-icons/react/dist/ssr";
import "@/styles/detailsmodal.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import type { ImageData } from "@/data/images";


interface DetailsModalProps {
    card: {
        title: string;
        images: ImageData[];
        detail: string;
    };
    onClose: () => void;
}


export default function DetailsModal({
    card,
    onClose,
}: DetailsModalProps) {

    return (
        <div
            className="details-modal-overlay"
            onClick={onClose}
        >

            <div
                className="details-modal-content"
                onClick={(e) => e.stopPropagation()}
            >

                <button
                    className="details-modal-close"
                    onClick={onClose}
                >
                    <X size={22} />
                </button>


                <div className="modal-img-container">

                    <Swiper
                        loop
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        slidesPerView={1}
                    >

                        {card.images.map((image) => (

                            <SwiperSlide key={image.id}>

                                <img
                                    src={image.url}
                                    alt={image.alt}
                                />

                            </SwiperSlide>

                        ))}

                    </Swiper>

                </div>


                <div className="modal-text-container">

                    <h3>
                        {card.title}
                    </h3>

                    <p>
                        {card.detail}
                    </p>

                </div>


            </div>

        </div>
    );
}