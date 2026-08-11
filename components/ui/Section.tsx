type SectionProps = {
    id?: string;
    variant?: "white" | "light" | "alt";
    children: React.ReactNode;
};


export default function Section({
    id,
    variant = "white",
    children
}: SectionProps) {

    return (

        <section 
            id={id}
            className={`section section-${variant}`}
        >

            {children}

        </section>

    );

}