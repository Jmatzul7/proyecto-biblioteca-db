// components/usuarios/RegisterUserForm.tsx
'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { useRouter } from 'next/navigation';

interface Role {
  ROL_ID: string;
  NOMBRE_ROL: string;
}

interface RegisterUserFormProps {
  onUserRegistered?: () => void;
  onCancel?: () => void;
}

export default function RegisterUserForm({ onUserRegistered, onCancel }: RegisterUserFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    usuario_login: '',
    contrasena: '',
    confirmar_contrasena: '',
    rol_id: ''
  });

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const result = await response.json();

      if (result.success) {
        setRoles(result.data);
        // Establecer rol por defecto (usuario normal)
        const rolUsuario = result.data.find((role: Role) => 
          role.NOMBRE_ROL.toLowerCase().includes('usuario') || role.ROL_ID === '2'
        );
        if (rolUsuario) {
          setFormData(prev => ({ ...prev, rol_id: rolUsuario.ROL_ID }));
        }
      }
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores al escribir
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }

    if (!formData.usuario_login.trim()) {
      setError('El nombre de usuario es obligatorio');
      return false;
    }

    if (formData.usuario_login.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }

    if (!formData.contrasena) {
      setError('La contraseña es obligatoria');
      return false;
    }

    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          usuario_login: formData.usuario_login.trim(),
          contrasena: formData.contrasena,
          rol_id: formData.rol_id || '2'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        resetForm();
        await new Promise(resolve => setTimeout(resolve, 3000));
        router.push('/dashboard');
        
        // Notificar al componente padre
        if (onUserRegistered) {
          onUserRegistered();
        }

        // Cerrar después de 2 segundos
        setTimeout(() => {
          if (onCancel) onCancel();
        }, 2000);
      } else {
        setError(result.message || 'Error al registrar el usuario');
      }
    } catch (err) {
      console.error('Error registrando usuario:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      usuario_login: '',
      contrasena: '',
      confirmar_contrasena: '',
      rol_id: roles.find(role => 
        role.NOMBRE_ROL.toLowerCase().includes('usuario') || role.ROL_ID === '2'
      )?.ROL_ID || ''
    });
  };

  const userIcon = (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const lockIcon = (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const roleIcon = (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  );

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Registrar Nuevo Usuario</h2>
        <p className="text-blue-200">Completa la información para crear una nueva cuenta de usuario</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ErrorAlert message={error} />

        {success && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
            <div className="flex items-center text-green-300">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              {userIcon}
              <span className="ml-2">Información Personal</span>
            </h3>
            
            <Input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez García"
              required
              label="Nombre Completo *"
              disabled={loading}
            />

            <Input
              id="usuario_login"
              name="usuario_login"
              type="text"
              value={formData.usuario_login}
              onChange={handleChange}
              placeholder="Ej: juan.perez"
              required
              label="Nombre de Usuario *"
              disabled={loading}
            />
          </div>

          {/* Seguridad y rol */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              {lockIcon}
              <span className="ml-2">Seguridad y Rol</span>
            </h3>

            <Input
              id="contrasena"
              name="contrasena"
              type="password"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              label="Contraseña *"
              icon={lockIcon}
              disabled={loading}
            />

            <Input
              id="confirmar_contrasena"
              name="confirmar_contrasena"
              type="password"
              value={formData.confirmar_contrasena}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              required
              label="Confirmar Contraseña *"
              icon={lockIcon}
              disabled={loading}
            />

            <div>
              <label htmlFor="rol_id" className="block text-blue-200 text-sm font-medium mb-2">
                Rol del Usuario
              </label>
              <select
                id="rol_id"
                name="rol_id"
                value={formData.rol_id}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-white/5 border border-white/20 rounded-xl text-white px-3 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
              >
                <option className='text-gray-700' value="">Seleccionar rol...</option>
                {roles.map((role) => (
                  <option className='text-gray-700' key={role.ROL_ID} value={role.ROL_ID}>
                    {role.NOMBRE_ROL}
                  </option>
                ))}
              </select>
              <p className="text-blue-300 text-xs mt-1">
                Por defecto se asigna el rol de Usuario
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-300 text-sm font-medium">Información importante</p>
              <ul className="text-blue-200 text-sm mt-1 space-y-1">
                <li>• El nombre de usuario debe ser único</li>
                <li>• La contraseña debe tener al menos 6 caracteres</li>
                <li>• El usuario podrá acceder al sistema inmediatamente</li>
                <li>• Los permisos se asignan según el rol seleccionado</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              disabled={loading}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            {loading ? 'Registrando...' : 'Registrar Usuario'}
          </Button>
        </div>
      </form>
    </div>
  );
}