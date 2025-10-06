// components/usuarios/UserCard.tsx
'use client';

interface User {
  USUARIO_ID: string;
  NOMBRE: string;
  USUARIO_LOGIN: string;
  ROL_ID: string;
  FECHA_REGISTRO: string;
  TIPO_USUARIO: string;
}

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRoleColor = (tipoUsuario: string) => {
    switch (tipoUsuario?.toLowerCase()) {
      case 'administrador':
        return 'bg-red-500';
      case 'bibliotecario':
        return 'bg-blue-500';
      case 'usuario':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleIcon = (tipoUsuario: string) => {
    switch (tipoUsuario?.toLowerCase()) {
      case 'administrador':
        return '👑';
      case 'bibliotecario':
        return '📚';
      case 'usuario':
        return '👤';
      default:
        return '❓';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
            {user.NOMBRE}
          </h3>
          <p className="text-blue-200 text-sm mt-1">@{user.USUARIO_LOGIN}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-2xl">{getRoleIcon(user.TIPO_USUARIO)}</span>
          <span className={`${getRoleColor(user.TIPO_USUARIO)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
            {user.TIPO_USUARIO || 'Sin rol'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-blue-300 font-medium">ID Usuario</p>
          <p className="text-white font-mono">#{user.USUARIO_ID}</p>
        </div>
        <div>
          <p className="text-blue-300 font-medium">Fecha Registro</p>
          <p className="text-white">{formatDate(user.FECHA_REGISTRO)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/20">
        <span className="text-blue-300 text-sm">
          Rol ID: <span className="text-white font-mono">{user.ROL_ID}</span>
        </span>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit?.(user)}
            className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar</span>
          </button>
          
        </div>
      </div>
    </div>
  );
}