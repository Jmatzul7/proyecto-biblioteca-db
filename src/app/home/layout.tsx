import Layout from '@/components/layout/Layout';

export const metadata = {
  title: 'Libros | Mi Biblioteca',
  description: 'Sistema de gestión de biblioteca con Oracle XE',
};


export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}