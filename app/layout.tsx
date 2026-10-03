import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import "@/app/globals.css";
import FloatingDonate from "@/components/ui/FloatingDonate";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/collaborate.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <div className="site-layout">

              <Header />

              <FloatingDonate />

              <main className="site-main">
                {children}
              </main>

              <Footer />

            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}