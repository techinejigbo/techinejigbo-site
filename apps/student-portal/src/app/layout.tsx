import type { Metadata } from "next";
import "./globals.css";
import StudentProvider from "../components/StudentProvider";

export const metadata: Metadata = {
  title: "TechinEjigbo Student Portal",
  description: "Learning Hub for TechinEjigbo students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StudentProvider>
          {children}
        </StudentProvider>
      </body>
    </html>
  );
}
