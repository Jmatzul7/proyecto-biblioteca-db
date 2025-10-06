interface BookFiltersProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  availabilityFilter: string;
  onAvailabilityChange: (availability: string) => void;
  genres: string[];
}

export default function BookFilters({
  selectedGenre,
  onGenreChange,
  availabilityFilter,
  onAvailabilityChange,
  genres
}: BookFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Filtro por género */}
      <select
        value={selectedGenre}
        onChange={(e) => onGenreChange(e.target.value)}
        className="bg-white/5 border border-white/20 rounded-2xl text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
      >
        <option className="text-gray-700"  value="">Todos los géneros</option>
        {genres.map((genre) => (
          <option className="text-gray-950 " key={genre} value={genre}>{genre}</option>
        ))}
      </select>

      {/* Filtro por disponibilidad */}
      <select
        value={availabilityFilter}
        onChange={(e) => onAvailabilityChange(e.target.value)}
        className="bg-white/5 border border-white/20 rounded-2xl text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
      >
        <option className="text-gray-700 "  value="all">Todos</option>
        <option className="text-gray-950 "  value="available">Disponibles</option>
        <option className="text-gray-950 "  value="unavailable">No disponibles</option>
      </select>
    </div>
  );
}