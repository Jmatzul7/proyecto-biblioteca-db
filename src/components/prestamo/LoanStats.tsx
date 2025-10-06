interface LoanStatsProps {
  loans: any[];
}

export default function LoanStats({ loans }: LoanStatsProps) {
  const stats = {
    total: loans.length,
    prestados: loans.filter(loan => loan.ESTADO === 'PRESTADO').length,
    devueltos: loans.filter(loan => loan.ESTADO === 'DEVUELTO').length,
    vencidos: loans.filter(loan => {
      return loan.ESTADO === 'PRESTADO' && 
             loan.FECHA_DEVOLUCION && 
             new Date(loan.FECHA_DEVOLUCION) < new Date();
    }).length,
    dañados: loans.filter(loan => loan.ESTADO === 'DANIADO').length
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
        <div className="text-2xl font-bold text-cyan-400 mb-2">{stats.total}</div>
        <div className="text-blue-200 text-sm">Total Préstamos</div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
        <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.prestados}</div>
        <div className="text-blue-200 text-sm">Prestados</div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
        <div className="text-2xl font-bold text-green-400 mb-2">{stats.devueltos}</div>
        <div className="text-blue-200 text-sm">Devueltos</div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
        <div className="text-2xl font-bold text-red-400 mb-2">{stats.vencidos}</div>
        <div className="text-blue-200 text-sm">Vencidos</div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
        <div className="text-2xl font-bold text-red-600 mb-2">{stats.vencidos}</div>
        <div className="text-blue-200 text-sm">Dañados</div>
      </div>
    </div>
  );
}