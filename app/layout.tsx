import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import "@/app/globals.css";
import FloatingDonate from "@/components/ui/FloatingDonate";
import { AuthProvider } from "@/context/AuthContext";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {

  return (
    <html lang="es">
      <body>

        <AuthProvider>

          <LanguageProvider>

            <Header />

            <FloatingDonate />

            {children}

            <Footer />

          </LanguageProvider>

        </AuthProvider>

      </body>
    </html>
  );
}