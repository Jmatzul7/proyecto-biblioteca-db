import Layout from '@/components/layout/Layout';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Libros | Mi Biblioteca',
  description: 'Sistema de gestión de biblioteca con Oracle XE',
};


export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}, <Analytics /> </Layout>; 

}