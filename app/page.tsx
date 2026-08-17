import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Impact from "@/components/sections/Impact";
import Activities from "@/components/sections/Activities";
import News from "@/components/sections/News";
import Collaborate from "@/components/sections/Collaborate";

export default function Home() {
    return (
        <>
            <main>
                <Hero />
                <About />
                <Impact />
                <Activities />
                <News />
                <Collaborate />
            </main>
        </>
    );
}