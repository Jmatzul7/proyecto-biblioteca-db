export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
      <p className="text-blue-200 text-sm">Verificando autenticación...</p>
    </div>
  );
}