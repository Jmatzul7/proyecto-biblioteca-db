import MyLoanCard from './MyLoanCard';

interface Autor {
  AUTOR_ID: string;
  NOMBRE_AUTOR: string;
  NACIONALIDAD: string;
}

interface MyLoan {
  USUARIO_ID: string;
  NOMBRE_USUARIO: string;
  LIBRO_ID: string;
  LIBRO_TITULO: string;
  AUTOR: Autor | string; // ← Cambiar a string | Autor para coincidir con MyLoanCard
  PRESTAMO_ID: string;
  FECHA_PRESTAMO: string;
  FECHA_DEVOLUCION: string | null;
  ESTADO: string;
}

interface MyLoanListProps {
  loans: MyLoan[];
  loading?: boolean;
  onShowDetails?: (loan: MyLoan) => void;
}

export default function MyLoanList({ loans, loading = false, onShowDetails }: MyLoanListProps) {
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
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl text-white font-semibold mb-2">No se encontraron préstamos</h3>
        <p className="text-blue-200">No tienes préstamos que coincidan con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <MyLoanCard 
          key={loan.PRESTAMO_ID} 
          loan={loan}
          onShowDetails={onShowDetails} 
        />
      ))}
    </div>
  );
}