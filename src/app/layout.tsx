import './globals.css';
export const metadata = {
  title: 'Inventario de Libros',
  description: 'Sistema de gestión de biblioteca con Oracle XE',
};
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}