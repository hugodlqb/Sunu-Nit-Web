"use client";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Impact from "@/components/sections/Impact";
import Activities from "@/components/sections/Activities";
import News from "@/components/sections/News";
import Collaborate from "@/components/sections/Collaborate";
import { useCollaborate } from "@/components/hooks/useCollaborate";

export default function Home() {
    const collaborate = useCollaborate();

    return (
        <>
            <main>
                <Hero />
                <About />
                <Impact />
                <Activities
                    onDonate={collaborate.openProjectDonation}
                />
                <News />
                <Collaborate
                    collaborate={collaborate}
                />
            </main>
        </>
    );
}
