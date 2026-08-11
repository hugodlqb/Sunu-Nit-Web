export const activityTranslations = {
    es: {
        breakfast_title: "Jornada de desayunos",
        breakfast_summary:
            "Una nueva jornada de apoyo alimentario junto a los niños talibé de Rufisque.",
        breakfast_detail:
            "Seguimos desarrollando el programa de desayunos diarios para garantizar que los niños puedan comenzar el día con una alimentación básica y saludable. Compartimos el proceso de preparación, organización y reparto junto al equipo local.",

        visit_title: "Visita del equipo voluntario",
        visit_summary:
            "El equipo local y los voluntarios realizaron actividades educativas.",
        visit_detail:
            "Durante esta visita, voluntarios y equipo local organizaron diferentes actividades educativas y de acompañamiento con los niños. Estos encuentros permiten reforzar el vínculo y conocer mejor sus necesidades.",

        meeting_title: "Encuentro del equipo Sunu Nit",
        meeting_summary:
            "Reunión de coordinación para preparar las próximas acciones sobre el terreno.",
        meeting_detail:
            "El equipo de Sunu Nit mantiene reuniones periódicas para coordinar las actividades, revisar necesidades y planificar nuevas acciones junto al equipo local en Senegal.",

        hygiene_title: "Mejoras del espacio de higiene",
        hygiene_summary:
            "Seguimiento de las mejoras realizadas en la zona de duchas y limpieza.",
        hygiene_detail:
            "Continuamos mejorando los espacios destinados a higiene personal, incorporando materiales necesarios y manteniendo un entorno seguro para los niños.",

        health_title: "Atención sanitaria",
        health_summary:
            "Jornadas de revisión y atención básica junto al equipo sanitario.",
        health_detail:
            "Las acciones sanitarias permiten realizar curas básicas, detectar necesidades y ofrecer una primera atención médica a los niños que lo necesitan.",

        category_food: "Alimentación",
        category_volunteers: "Voluntariado",
        category_organization: "Organización",
        category_hygiene: "Higiene",
        category_health: "Salud",
    },

    en: {
        breakfast_title: "Breakfast Program",
        breakfast_summary:
            "A new food support day with the talibé children of Rufisque.",
        breakfast_detail:
            "We continue developing the daily breakfast program to ensure children can start the day with a healthy meal. Here we share the preparation, organization and distribution carried out together with the local team.",

        visit_title: "Volunteer Team Visit",
        visit_summary:
            "The local team and volunteers carried out educational activities.",
        visit_detail:
            "During this visit, volunteers and the local team organized educational and recreational activities with the children, strengthening relationships and identifying new needs.",

        meeting_title: "Sunu Nit Team Meeting",
        meeting_summary:
            "Coordination meeting to prepare the next field activities.",
        meeting_detail:
            "The Sunu Nit team regularly meets to coordinate ongoing projects, review priorities and organize future actions together with the local team in Senegal.",

        hygiene_title: "Hygiene Area Improvements",
        hygiene_summary:
            "Progress on the improvements made to the showers and hygiene facilities.",
        hygiene_detail:
            "We continue improving hygiene facilities by adding equipment and maintaining a clean and safe environment for the children.",

        health_title: "Medical Assistance",
        health_summary:
            "Basic healthcare and medical support sessions.",
        health_detail:
            "Healthcare activities provide basic treatment, identify medical needs and offer first aid whenever necessary.",

        category_food: "Food",
        category_volunteers: "Volunteering",
        category_organization: "Organization",
        category_hygiene: "Hygiene",
        category_health: "Healthcare",
    },

    fr: {
        breakfast_title: "Journée des petits-déjeuners",
        breakfast_summary:
            "Une nouvelle journée de soutien alimentaire avec les enfants talibé de Rufisque.",
        breakfast_detail:
            "Nous poursuivons le programme de petits-déjeuners quotidiens afin de garantir que les enfants commencent la journée avec une alimentation saine. Nous partageons ici la préparation, l'organisation et la distribution réalisées avec l'équipe locale.",

        visit_title: "Visite de l'équipe bénévole",
        visit_summary:
            "L'équipe locale et les bénévoles ont organisé des activités éducatives.",
        visit_detail:
            "Pendant cette visite, les bénévoles et l'équipe locale ont organisé différentes activités éducatives et d'accompagnement afin de renforcer les liens avec les enfants et de mieux comprendre leurs besoins.",

        meeting_title: "Réunion de l'équipe Sunu Nit",
        meeting_summary:
            "Réunion de coordination pour préparer les prochaines actions sur le terrain.",
        meeting_detail:
            "L'équipe Sunu Nit se réunit régulièrement afin de coordonner les projets, analyser les besoins et préparer les futures actions avec l'équipe locale au Sénégal.",

        hygiene_title: "Amélioration de l'espace d'hygiène",
        hygiene_summary:
            "Suivi des améliorations réalisées dans les douches et les espaces de nettoyage.",
        hygiene_detail:
            "Nous poursuivons l'amélioration des espaces d'hygiène en ajoutant de nouveaux équipements et en maintenant un environnement propre et sûr pour les enfants.",

        health_title: "Assistance médicale",
        health_summary:
            "Journées de soins et d'assistance sanitaire.",
        health_detail:
            "Les actions médicales permettent d'assurer les premiers soins, de détecter les besoins et d'apporter une assistance de base aux enfants.",

        category_food: "Alimentation",
        category_volunteers: "Bénévolat",
        category_organization: "Organisation",
        category_hygiene: "Hygiène",
        category_health: "Santé",
    },
};
export type ActivityTranslationKey =
    keyof typeof activityTranslations.es;

export type ActivityLanguage =
    keyof typeof activityTranslations;