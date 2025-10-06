import LoanCard from './LoanCard';

interface Loan {
  USUARIO_ID: string;
  PRESTAMO_ID: string;
  LIBRO_ID: string;
  USUARIO_NOMBRE: string;
  LIBRO_TITULO: string;
  FECHA_PRESTAMO: string;
  FECHA_DEVOLUCION: string | null;
  ESTADO: string;

}

interface LoanListProps {
  loans: Loan[];
  loading?: boolean;
  onLoanUpdate?: () => void; 
}

export default function LoanList({ loans, loading = false, onLoanUpdate }: LoanListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/10 rounded-2xl p-6 h-32 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl text-white font-semibold mb-2">No se encontraron préstamos</h3>
        <p className="text-blue-200">No hay préstamos que coincidan con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <LoanCard 
          key={loan.PRESTAMO_ID} 
          loan={loan}
          onLoanUpdate={onLoanUpdate} // ← Pasar la función de actualización
        />
      ))}
    </div>
  );
}