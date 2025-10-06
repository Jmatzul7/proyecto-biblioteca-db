// components/usuarios/UserList.tsx
import UserCard from './UserCard';

interface User {
  USUARIO_ID: string;
  NOMBRE: string;
  USUARIO_LOGIN: string;
  ROL_ID: string;
  FECHA_REGISTRO: string;
  TIPO_USUARIO: string;
}

interface UserListProps {
  users: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export default function UserList({ users, loading = false, onEdit, onDelete }: UserListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/10 rounded-2xl p-6 h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl text-white font-semibold mb-2">No se encontraron usuarios</h3>
        <p className="text-blue-200">No hay usuarios que coincidan con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard 
          key={user.USUARIO_ID} 
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}