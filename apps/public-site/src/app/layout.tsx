import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techinejigbo.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "TechinEjigbo | Empowering Youths Through Tech",
    template: "%s | TechinEjigbo",
  },
  description:
    "Equipping underprivileged youths and teenagers in Ejigbo with world-class tech skills. From zero to hero, we’re building the next generation of developers, designers, and digital innovators.",
  keywords: [
    "TechinEjigbo",
    "Tech in Ejigbo",
    "Tech training Ejigbo",
    "Learn coding Ejigbo Lagos",
    "Web development training Ejigbo",
    "Graphic design training Nigeria",
    "Youth empowerment Ejigbo",
    "Free tech education Nigeria",
    "Ejigbo digital skills",
  ],
  authors: [{ name: "TechinEjigbo Initiative", url: baseUrl }],
  creator: "TechinEjigbo",
  publisher: "TechinEjigbo",
  formatDetection: {
    email: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TechinEjigbo | Empowering Youths Through Tech",
    description:
      "Equipping underprivileged youths and teenagers in Ejigbo with world-class tech skills. From zero to hero, we’re building the next generation of developers, designers, and digital innovators.",
    url: baseUrl,
    siteName: "TechinEjigbo",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/TechinEjigboLogo.png",
        width: 800,
        height: 800,
        alt: "TechinEjigbo Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechinEjigbo | Empowering Youths Through Tech",
    description:
      "Equipping underprivileged youths and teenagers in Ejigbo with world-class tech skills.",
    site: "@TechinEjigbo",
    creator: "@TechinEjigbo",
    images: ["/TechinEjigboLogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/TechinEjigboLogo.png",
    shortcut: "/TechinEjigboLogo.png",
    apple: "/TechinEjigboLogo.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${baseUrl}/#organization`,
      name: "TechinEjigbo",
      url: baseUrl,
      logo: `${baseUrl}/TechinEjigboLogo.png`,
      email: "techinejigbo@gmail.com",
      description:
        "Equipping underprivileged youths and teenagers in Ejigbo with world-class tech skills in Web Development, Graphic Design, and Digital Literacy.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ejigbo",
        addressRegion: "Lagos State",
        addressCountry: "NG",
      },
      sameAs: [
        "https://x.com/TechinEjigbo",
        "https://facebook.com/Tech-In-Ejigbo-61567228547648",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "TechinEjigbo",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      inLanguage: "en-NG",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

