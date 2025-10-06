// app/home/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import BooksPage from './libros/page';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-blue-200">Cargando...</p>
        </div>
      </section>
    );
  }

  return (
    <div>
      <BooksPage/>
    </div>
  );
}