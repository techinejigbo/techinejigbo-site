import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donate & Support | Sponsor a Student',
  description:
    'Support TechinEjigbo through financial contributions or hardware donations (laptops, monitors, power accessories). Help empower underprivileged youth in Ejigbo with digital skills.',
  alternates: {
    canonical: '/donate',
  },
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
