// components/prestamo/misprestamos/UserProfile.tsx
interface UserProfileProps {
  userData: {
    nombre: string;
    usuario: string;
    prestamosActivos: number;
    prestamosTotales: number;
  };
}

export default function UserProfile({ userData }: UserProfileProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {userData.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{userData.nombre}</h2>
            <p className="text-blue-200">@{userData.usuario}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{userData.prestamosActivos}</div>
            <div className="text-blue-200 text-sm">Activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{userData.prestamosTotales}</div>
            <div className="text-blue-200 text-sm">Totales</div>
          </div>
        </div>
      </div>
    </div>
  );
}