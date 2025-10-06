interface BookSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function BookSearch({ searchTerm, onSearchChange }: BookSearchProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
        placeholder="Buscar por título, autor o género..."
      />
    </div>
  );
}