interface LoanFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const statusFilters = [
  { value: 'all', label: 'Todos', color: 'bg-gray-500' },
  { value: 'PRESTADO', label: 'Prestados', color: 'bg-yellow-500' },
  { value: 'DEVUELTO', label: 'Devueltos', color: 'bg-green-500' },
  { value: 'VENCIDO', label: 'Vencidos', color: 'bg-red-500' },
  { value: 'DANIADO', label: 'Dañados', color: 'bg-red-700' },
];

export default function LoanFilters({ selectedStatus, onStatusChange }: LoanFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {statusFilters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onStatusChange(filter.value)}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
            selectedStatus === filter.value
              ? `${filter.color} text-white shadow-lg`
              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}