import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import SiteChrome from "@/components/layout/SiteChrome";
import { LanguageProvider } from "@/context/LanguageContext";
import "@/app/globals.css";
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

              <SiteChrome />

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