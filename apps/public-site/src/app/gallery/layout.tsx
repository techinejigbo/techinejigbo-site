import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery & Student Showcase',
  description:
    'Browse the visual showcase of TechinEjigbo students in action: web development projects, graphic design designs, classroom sessions, and community moments.',
  alternates: {
    canonical: '/gallery',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
