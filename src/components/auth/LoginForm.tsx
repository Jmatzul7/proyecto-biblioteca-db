'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginHeader from './LoginHeader';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Link from 'next/link';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    usuario_login: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.usuario_login.trim() || !formData.contrasena.trim()) {
        setError('Por favor completa todos los campos');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
        }
       // router.push('/home/libros');
        window.location.href = '/home/libros';

      } else {
        setError(data.message || 'Error en el inicio de sesión');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      usuario_login: 'mgonzalez',
      contrasena: 'admin123'
    });
  };

  // Iconos para los inputs
  const userIcon = (
    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const passwordIcon = (
    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const loginIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );

  return (
    <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 relative z-10 transform transition-all duration-500 hover:shadow-3xl">
      <LoginHeader />
      
      <ErrorAlert message={error} className="mb-6" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="usuario_login"
          name="usuario_login"
          type="text"
          value={formData.usuario_login}
          onChange={handleChange}
          placeholder="Ingresa tu usuario"
          disabled={loading}
          icon={userIcon}
          label="Usuario"
          required
        />

        <Input
          id="contrasena"
          name="contrasena"
          type="password"
          value={formData.contrasena}
          onChange={handleChange}
          placeholder="Ingresa tu contraseña"
          disabled={loading}
          icon={passwordIcon}
          label="Contraseña"
          required
        />

        <div className="space-y-3">
          <Button
            type="submit"
            loading={loading}
            icon={loginIcon}
            className="w-full"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
          
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2 px-4 border border-cyan-400/50 rounded-xl text-sm font-semibold text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cargar credenciales de demo
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-cyan-300 hover:text-cyan-200 text-sm transition-colors duration-300 inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}