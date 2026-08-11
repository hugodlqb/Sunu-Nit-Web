import { images } from "@/data/images";
import { galleries } from "@/data/galleries";
import type { ImageData } from "@/data/images";
import type { ActivityTranslationKey } from "@/i18n/translatActivities";
import type { ActivityLanguage } from "@/i18n/translatActivities";


export interface ActivityUpdate {

    id: string;

    date: string;

    title: string;

    text: string;

    images: ImageData[];

}


export interface ActivityData {

    id: string;

    titleKey: ActivityTranslationKey;

    summaryKey: ActivityTranslationKey;

    detailKey: ActivityTranslationKey;

    categoryKey: ActivityTranslationKey;

    coverImage: ImageData;

    updates: ActivityUpdate[];

    status: "active" | "finished";

}



export const activities: Record<ActivityLanguage, ActivityData[]> = {


    es: [

        {
            id: "breakfast",

            titleKey: "breakfast_title",
            summaryKey: "breakfast_summary",
            detailKey: "breakfast_detail",
            categoryKey: "category_food",

            coverImage: images.actBreakfast,

            status: "active",


            updates: [

                {
                    id: "breakfast-2027-03-23",

                    date: "23 Marzo 2027",

                    title: "Nueva jornada de desayunos",

                    text:
                        "El equipo local continúa preparando desayunos diarios para los niños, organizando la compra de alimentos y el reparto en el centro.",

                    images:
                        galleries.actBreakfast,
                },


                {
                    id: "breakfast-2027-03-15",

                    date: "15 Marzo 2027",

                    title: "Organización semanal del programa",

                    text:
                        "Se revisaron las necesidades de alimentación y la planificación de las próximas jornadas.",

                    images:
                        [],
                },
                {
                    id: "breakfast-3",

                    date: "1 Marzo 2027",

                    title: "Seguimiento del programa de desayunos",

                    text:
                        "El equipo local continúa evaluando el funcionamiento del programa, revisando las necesidades de los niños y preparando nuevas acciones para mantener una alimentación diaria estable.",

                    images:
                        [],
                },

            ]

        },


        {
            id: "health",

            titleKey: "health_title",
            summaryKey: "health_summary",
            detailKey: "health_detail",
            categoryKey: "category_health",

            coverImage: images.actHealth,

            status: "active",


            updates: [

                {
                    id: "health-2024-07-22",

                    date: "22 Julio 2024",

                    title: "Jornada de atención sanitaria",

                    text:
                        "El equipo realizó revisiones básicas y curas junto a los niños que necesitaban atención.",

                    images:
                        galleries.actHealth,
                }

            ]

        },


        {
            id: "hygiene",

            titleKey: "hygiene_title",
            summaryKey: "hygiene_summary",
            detailKey: "hygiene_detail",
            categoryKey: "category_hygiene",

            coverImage: images.actHygiene,

            status: "active",


            updates: [

                {
                    id: "hygiene-2024-08-05",

                    date: "5 Agosto 2024",

                    title: "Mejoras del espacio de higiene",

                    text:
                        "Seguimos trabajando en el mantenimiento de las duchas y los espacios de limpieza del centro.",

                    images:
                        galleries.actHygiene,
                }

            ]

        },


        {
            id: "volunteers",

            titleKey: "visit_title",
            summaryKey: "visit_summary",
            detailKey: "visit_detail",
            categoryKey: "category_volunteers",

            coverImage: images.actVisit,

            status: "active",


            updates: [

                {
                    id: "volunteers-2024-09-20",

                    date: "20 Septiembre 2024",

                    title: "Visita del equipo voluntario",

                    text:
                        "Los voluntarios realizaron actividades educativas y acompañamiento junto al equipo local.",

                    images:
                        galleries.actVisit,
                }

            ]

        },


        {
            id: "team",

            titleKey: "meeting_title",
            summaryKey: "meeting_summary",
            detailKey: "meeting_detail",
            categoryKey: "category_organization",

            coverImage: images.actMeet,

            status: "active",


            updates: [

                {
                    id: "team-2024-09-15",

                    date: "15 Septiembre 2024",

                    title: "Encuentro del equipo Sanoé",

                    text:
                        "El equipo coordinó las próximas acciones y revisó las necesidades actuales del proyecto.",

                    images:
                        galleries.actMeet,
                }

            ]

        }

    ],
    en: [
    {
        id: "breakfast",
        titleKey: "breakfast_title",
        summaryKey: "breakfast_summary",
        detailKey: "breakfast_detail",
        categoryKey: "category_food",
        coverImage: images.actBreakfast,
        status: "active",
        updates: [
            {
                id: "breakfast-2027-03-23",
                date: "23 March 2027",
                title: "New breakfast program day",
                text: "The local team continues preparing daily breakfasts for the children, organizing food purchases and distribution at the center.",
                images: galleries.actBreakfast,
            },
            {
                id: "breakfast-2027-03-15",
                date: "15 March 2027",
                title: "Weekly program organization",
                text: "Food needs and planning for the next sessions were reviewed.",
                images: [],
            },
            {
                id: "breakfast-2027-03-01",
                date: "1 March 2027",
                title: "Breakfast program follow-up",
                text: "The local team continues evaluating the program, reviewing children's needs and preparing new actions to maintain stable daily nutrition.",
                images: [],
            },
        ],
    },
    {
        id: "health",
        titleKey: "health_title",
        summaryKey: "health_summary",
        detailKey: "health_detail",
        categoryKey: "category_health",
        coverImage: images.actHealth,
        status: "active",
        updates: [
            {
                id: "health-2024-07-22",
                date: "22 July 2024",
                title: "Healthcare support day",
                text: "The team carried out basic check-ups and treatments with children requiring attention.",
                images: galleries.actHealth,
            },
        ],
    },
    {
        id: "hygiene",
        titleKey: "hygiene_title",
        summaryKey: "hygiene_summary",
        detailKey: "hygiene_detail",
        categoryKey: "category_hygiene",
        coverImage: images.actHygiene,
        status: "active",
        updates: [
            {
                id: "hygiene-2024-08-05",
                date: "5 August 2024",
                title: "Hygiene area improvements",
                text: "We continue working on maintaining the showers and cleaning spaces at the center.",
                images: galleries.actHygiene,
            },
        ],
    },
    {
        id: "volunteers",
        titleKey: "visit_title",
        summaryKey: "visit_summary",
        detailKey: "visit_detail",
        categoryKey: "category_volunteers",
        coverImage: images.actVisit,
        status: "active",
        updates: [
            {
                id: "volunteers-2024-09-20",
                date: "20 September 2024",
                title: "Volunteer team visit",
                text: "Volunteers carried out educational activities and provided support together with the local team.",
                images: galleries.actVisit,
            },
        ],
    },
    {
        id: "team",
        titleKey: "meeting_title",
        summaryKey: "meeting_summary",
        detailKey: "meeting_detail",
        categoryKey: "category_organization",
        coverImage: images.actMeet,
        status: "active",
        updates: [
            {
                id: "team-2024-09-15",
                date: "15 September 2024",
                title: "Sanoé team meeting",
                text: "The team coordinated upcoming actions and reviewed current project needs.",
                images: galleries.actMeet,
            },
        ],
    },
],

fr: [
    {
        id: "breakfast",
        titleKey: "breakfast_title",
        summaryKey: "breakfast_summary",
        detailKey: "breakfast_detail",
        categoryKey: "category_food",
        coverImage: images.actBreakfast,
        status: "active",
        updates: [
            {
                id: "breakfast-2027-03-23",
                date: "23 mars 2027",
                title: "Nouvelle journée de petits-déjeuners",
                text: "L'équipe locale continue de préparer les petits-déjeuners quotidiens pour les enfants, en organisant les achats alimentaires et la distribution au centre.",
                images: galleries.actBreakfast,
            },
            {
                id: "breakfast-2027-03-15",
                date: "15 mars 2027",
                title: "Organisation hebdomadaire du programme",
                text: "Les besoins alimentaires et la planification des prochaines journées ont été étudiés.",
                images: [],
            },
            {
                id: "breakfast-2027-03-01",
                date: "1 mars 2027",
                title: "Suivi du programme de petits-déjeuners",
                text: "L'équipe locale continue d'évaluer le fonctionnement du programme et de préparer de nouvelles actions.",
                images: [],
            },
        ],
    },
    {
        id: "health",
        titleKey: "health_title",
        summaryKey: "health_summary",
        detailKey: "health_detail",
        categoryKey: "category_health",
        coverImage: images.actHealth,
        status: "active",
        updates: [
            {
                id: "health-2024-07-22",
                date: "22 juillet 2024",
                title: "Journée de soins médicaux",
                text: "L'équipe a réalisé des contrôles de base et des soins auprès des enfants ayant besoin d'attention.",
                images: galleries.actHealth,
            },
        ],
    },
    {
        id: "hygiene",
        titleKey: "hygiene_title",
        summaryKey: "hygiene_summary",
        detailKey: "hygiene_detail",
        categoryKey: "category_hygiene",
        coverImage: images.actHygiene,
        status: "active",
        updates: [
            {
                id: "hygiene-2024-08-05",
                date: "5 août 2024",
                title: "Amélioration de l'espace d'hygiène",
                text: "Nous continuons à améliorer les douches et les espaces de nettoyage du centre.",
                images: galleries.actHygiene,
            },
        ],
    },
    {
        id: "volunteers",
        titleKey: "visit_title",
        summaryKey: "visit_summary",
        detailKey: "visit_detail",
        categoryKey: "category_volunteers",
        coverImage: images.actVisit,
        status: "active",
        updates: [
            {
                id: "volunteers-2024-09-20",
                date: "20 septembre 2024",
                title: "Visite de l'équipe bénévole",
                text: "Les bénévoles ont réalisé des activités éducatives avec l'équipe locale.",
                images: galleries.actVisit,
            },
        ],
    },
    {
        id: "team",
        titleKey: "meeting_title",
        summaryKey: "meeting_summary",
        detailKey: "meeting_detail",
        categoryKey: "category_organization",
        coverImage: images.actMeet,
        status: "active",
        updates: [
            {
                id: "team-2024-09-15",
                date: "15 septembre 2024",
                title: "Réunion de l'équipe Sanoé",
                text: "L'équipe a coordonné les prochaines actions et analysé les besoins actuels du projet.",
                images: galleries.actMeet,
            },
        ],
    },
],

};