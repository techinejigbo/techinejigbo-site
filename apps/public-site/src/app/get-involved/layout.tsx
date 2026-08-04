import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Involved | Volunteer & Mentor',
  description:
    'Join our volunteer faculty as a programming tutor, design mentor, guest masterclass speaker, or community coordinator to empower youths in Ejigbo.',
  alternates: {
    canonical: '/get-involved',
  },
};

export default function GetInvolvedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
