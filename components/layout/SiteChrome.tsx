"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import FloatingDonate from "@/components/ui/FloatingDonate";

export default function SiteChrome() {
    const [accountOpen, setAccountOpen] = useState(false);

    return (
        <>
            <Header
                accountOpen={accountOpen}
                onOpenAccount={() => setAccountOpen(true)}
                onCloseAccount={() => setAccountOpen(false)}
            />

            <FloatingDonate accountOpen={accountOpen} />
        </>
    );
}