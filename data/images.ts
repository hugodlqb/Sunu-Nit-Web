export interface ImageData {
    id: string;
    url: string;
    alt: string;

    width?: number;
    height?: number;
}


export const images = {


    /*////////////////////
    //     HEADER       //
    ////////////////////*/

    logo: {
        id: "logo",
        url: "/images/logo.svg",
        alt: "Logo Sunu Nit",
        width: 200,
        height: 65,
    },


    /*////////////////////
    //     HERO         //
    ////////////////////*/

    hero: {
        id: "hero",
        url: "https://images.unsplash.com/photo-1649750158856-0db011d9e34c?q=80&w=2071",
        alt: "Niños talibé de Sunu Nit",
    },

    /*////////////////////
    //     ABOUT        //
    ////////////////////*/

    teamJose: {
        id: "teamJose",
        url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300",
        alt: "Jose Pandares",
    },

    teamDiana: {
        id: "teamDiana",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
        alt: "Diana Miquel",
    },

    teamHugo: {
        id: "teamHugo",
        url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300",
        alt: "Hugo de la Quintana",
    },

    /*////////////////////
    //     IMPACT       //
    ////////////////////*/

    impactFood: {
        id: "impactFood",
        url: "https://images.unsplash.com/photo-1543352634-99a5d50ae78e?q=80&w=800",
        alt: "Alimentación niños talibé",
    },


    impactHealth: {
        id: "impactHealth",
        url: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=800",
        alt: "Atención sanitaria niños talibé",
    },


    impactHygiene: {
        id: "impactHygiene",
        url: "https://images.unsplash.com/photo-1584744646898-40ff0404e767?q=80&w=1170",
        alt: "Espacio de higiene para niños talibé",
    },

    /*////////////////////
    //     NEWS         //
    ////////////////////*/

    newsBlankets: {
        id: "newsBlankets",
        url: "https://images.unsplash.com/photo-1600369672770-985fd30004eb?q=80&w=817",
        alt: "Blankets",
    },
    
    newsTalks: {
        id: "newsTalks",
        url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=400",
        alt: "Charlas solidarias en institutos",
    },

    newsShowers: {
        id: "newsShowers",
        url: "https://images.unsplash.com/photo-1574607383476-f517f260d30b?q=80&w=400",
        alt: "Ampliación de ducha sanitaria",
    },

    /*////////////////////
    //     ACTIVITIES   //
    ////////////////////*/

    actBreakfast: {
        id: "actBreakfast",
        url: "https://images.unsplash.com/photo-1608198093039-81259e1b10e0?q=80&w=1073",
        alt: "Blankets",
    },
    
    actVisit: {
        id: "actVisit",
        url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1170",
        alt: "Charlas solidarias en institutos",
    },

    actMeet: {
        id: "actMeet",
        url: "https://images.unsplash.com/photo-1536181783029-1097aaf179de?q=80&w=1172",
        alt: "Ampliación de ducha sanitaria",
    },
    
    actHygiene: {
        id: "actVisit",
        url: "https://images.unsplash.com/photo-1571712704100-5cade806bf6d?q=80&w=889",
        alt: "Charlas solidarias en institutos",
    },

    actHealth: {
        id: "actVisit",
        url: "https://images.unsplash.com/photo-1624638760852-8ede1666ab07?q=80&w=1170",
        alt: "Ampliación de ducha sanitaria",
    },


} satisfies Record<string, ImageData>;