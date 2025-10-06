interface SubmitButtonProps {
  loading: boolean;
  disabled?: boolean;
}

export default function SubmitButton({ loading, disabled = false }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
        {loading ? (
          <div className="w-5 h-5 border-2 border-cyan-200 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="h-5 w-5 text-cyan-200 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        )}
      </span>
      {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
    </button>
  );
}