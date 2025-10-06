// app/home/usuarios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import UserList from '@/components/usuarios/UserList';
import UserFilters from '@/components/usuarios/UserFilters';
import EditUserModal from '@/components/usuarios/EditUserModal';

interface User {
  USUARIO_ID: string;
  NOMBRE: string;
  USUARIO_LOGIN: string;
  ROL_ID: string;
  FECHA_REGISTRO: string;
  TIPO_USUARIO: string;
}

export default function UsuariosPage() {
  const { user } = useAuth(); // Obtener información del usuario loggeado
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  
  // Estados para el modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedRole) params.append('rol', selectedRole);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/usuarios?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
        // Extraer roles únicos para los filtros
        const uniqueRoles = [...new Set(result.data.map((user: User) => user.TIPO_USUARIO))].filter(Boolean) as string[];
        setRoles(uniqueRoles);
      } else {
        console.error('Error fetching users:', result.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filtrar por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.NOMBRE.toLowerCase().includes(searchLower) ||
        user.USUARIO_LOGIN.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por rol
    if (selectedRole) {
      filtered = filtered.filter(user => user.TIPO_USUARIO === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUserUpdated = () => {
    // Recargar la lista de usuarios después de editar
    fetchUsers();
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  // Calcular estadísticas
  const stats = {
    total: users.length,
    administradores: users.filter(user => user.TIPO_USUARIO === 'Administrador').length,
    bibliotecarios: users.filter(user => user.TIPO_USUARIO === 'Bibliotecario').length,
    usuarios: users.filter(user => user.TIPO_USUARIO === 'Usuario').length,
    filtered: filteredUsers.length
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header con información de administrador */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Gestión de Usuarios
              </h1>
              <p className="text-xl text-blue-200 max-w-2xl">
                Administra y consulta todos los usuarios del sistema de biblioteca
              </p>
              {user && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-blue-300">Conectado como administrador:</span>
                  <span className="text-sm bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                    {user.nombre}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Cargando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar
                  </>
                )}
              </button>
              
              <a
                href="/home/usuarios/registrar"
                className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Usuario
              </a>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.total}</div>
              <div className="text-blue-200">Total usuarios</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-red-400 mb-2">{stats.administradores}</div>
              <div className="text-blue-200">Administradores</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stats.bibliotecarios}</div>
              <div className="text-blue-200">Bibliotecarios</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-green-400 mb-2">{stats.usuarios}</div>
              <div className="text-blue-200">Usuarios</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.filtered}</div>
              <div className="text-blue-200">Resultados</div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
            roles={roles}
          />

          {/* Lista de usuarios */}
          <UserList 
            users={filteredUsers} 
            loading={loading}
            onEdit={handleEditUser}
          />

          {/* Modal de edición */}
          <EditUserModal
            isOpen={editModalOpen}
            onClose={handleCloseEditModal}
            user={selectedUser}
            onUserUpdated={handleUserUpdated}
          />

          {/* Información cuando no hay resultados */}
          {!loading && filteredUsers.length === 0 && users.length > 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl text-white font-semibold mb-2">No se encontraron usuarios</h3>
              <p className="text-blue-200">Intenta con otros términos de búsqueda o filtros</p>
            </div>
          )}

          {/* Información cuando no hay usuarios */}
          {!loading && users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl text-white font-semibold mb-2">No hay usuarios registrados</h3>
              <p className="text-blue-200 mb-6">Comienza registrando el primer usuario del sistema.</p>
              <a
                href="/home/usuarios/registrar"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Registrar Primer Usuario
              </a>
            </div>
          )}

          {/* Información adicional para administradores */}
          <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h4 className="text-red-300 font-semibold">Acceso de Administrador</h4>
                <p className="text-blue-200 text-sm mt-1">
                  Esta sección está restringida exclusivamente para administradores. Desde aquí puedes gestionar todos los usuarios del sistema, 
                  asignar roles, editar información y mantener el control de acceso a la plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}