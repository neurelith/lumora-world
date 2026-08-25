import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ServiceWorkerRegistrar } from "@/components/ui/ServiceWorkerRegistrar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const sora = Sora({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-display", display: "swap" });
const jetMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
const notoDeva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "500", "600", "700"], variable: "--font-devanagari", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://lumora-world.vercel.app"),
  title: {
    default: "Lumora World — Five Worlds of Learning in Your Classroom",
    template: "%s · Lumora World",
  },
  description:
    "Tablet-first bilingual screening & adaptive practice platform for dyslexia, dysgraphia, and neurodevelopmental triage in primary schoolchildren. DALI-aligned, 100% client-side privacy.",
  keywords: [
    "dyslexia screening India",
    "DALI",
    "dysgraphia",
    "learning disability screening",
    "bilingual education Hindi English",
    "classroom triage tool",
    "NBRC",
    "special education technology",
  ],
  manifest: "/manifest.json",
  applicationName: "Lumora World",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lumora World",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/lumora_logo_transparent.png", type: "image/png" }],
    apple: [{ url: "/lumora_logo_transparent.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "Lumora World",
    title: "Lumora World — Five Worlds of Learning in Your Classroom",
    description:
      "Camera air-tracing + gamified screening for dyslexia & dysgraphia triage, aligned with DALI (NBRC). Works on any classroom tablet, offline-ready.",
    images: [{ url: "/lumora_logo_transparent.png", width: 512, height: 512 }],
    locale: "en_IN",
    alternateLocale: "hi_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumora World — Five Worlds of Learning in Your Classroom",
    description:
      "Tablet-first bilingual dyslexia screening & adaptive practice. DALI-aligned. Zero biometric transmission.",
    images: ["/lumora_logo_transparent.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#c96442",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lumora World",
  alternateName: "Lumora",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web (iOS, Android, Windows, ChromeOS tablets)",
  description:
    "Tablet-first bilingual screening & adaptive practice platform for dyslexia, dysgraphia, and neurodevelopmental triage in primary schoolchildren ages 5-8.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  featureList: [
    "15-minute gamified classroom screening battery",
    "Camera air-tracing kinematic motor assessment",
    "Bilingual English / Hindi (Devanagari)",
    "DALI (NBRC) framework aligned thresholds",
    "100% client-side processing, zero biometric transmission",
    "Offline-first PWA for municipal schools",
  ],
  audience: {
    "@type": "EducationalAudience",
    educationalRole: ["teacher", "specialist", "parent"],
  },
};

const skipLinkStyles = `
  .skip-link {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
  }
  .skip-link:focus {
    left: 1rem;
    top: 1rem;
    background: #c96442;
    color: #FFFFFF;
    padding: 0.75rem 1.25rem;
    border-radius: 0.75rem;
    font-weight: 700;
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${jetMono.variable} ${notoDeva.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <style>{skipLinkStyles}</style>
      </head>
      <body className="min-h-screen bg-paper text-ink selection:bg-amber-200">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <CustomCursor />
        <ErrorBoundary>
          <I18nProvider>{children}</I18nProvider>
        </ErrorBoundary>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
