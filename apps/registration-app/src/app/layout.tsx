import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechinEjigbo - Trainee Registration",
  description: "Register for TechinEjigbo programs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
