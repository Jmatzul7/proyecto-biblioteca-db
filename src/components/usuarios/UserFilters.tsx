// components/usuarios/UserFilters.tsx
'use client';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  roles: string[];
}

export default function UserFilters({ 
  searchTerm, 
  onSearchChange, 
  selectedRole, 
  onRoleChange, 
  roles 
}: UserFiltersProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Búsqueda */}
        <div className="flex-1 w-full lg:max-w-md">
          <label htmlFor="search" className="block text-blue-200 text-sm font-medium mb-2">
            Buscar usuarios
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre o usuario..."
              className="w-full bg-white/5 border border-white/20 rounded-xl text-white px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <svg 
              className="w-5 h-5 text-blue-300 absolute left-3 top-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filtro por rol */}
        <div className="w-full lg:w-64">
          <label htmlFor="role" className="block text-blue-200 text-sm font-medium mb-2">
            Filtrar por rol
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-xl text-white px-3 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option className='text-gray-700' value="">Todos los roles</option>
            {roles.map((role) => (
              <option className='text-gray-700' key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {(searchTerm || selectedRole) && (
        <div className="mt-4 text-blue-200 text-sm">
          Filtros aplicados:
          {searchTerm && <span className="text-white ml-2">Búsqueda: &quot;{searchTerm}&quot;</span>}
          {selectedRole && <span className="text-white ml-2">Rol: {selectedRole}</span>}
        </div>
      )}
    </div>
  );
}