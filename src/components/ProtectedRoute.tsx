// components/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-blue-200">Verificando autenticación...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return null; // Será redirigido por el useEffect
  }

  return <>{children}</>;
}