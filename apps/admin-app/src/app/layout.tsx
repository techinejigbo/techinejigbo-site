import type { Metadata } from "next";
import "./globals.css";
import AdminProvider from "../components/AdminProvider";

export const metadata: Metadata = {
  title: "TechinEjigbo Admin Portal",
  description: "Administrative portal for TechinEjigbo.",
  icons: {
    icon: "/TechinEjigboLogo.png",
    shortcut: "/TechinEjigboLogo.png",
    apple: "/TechinEjigboLogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AdminProvider>
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}
