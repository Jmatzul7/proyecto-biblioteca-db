interface DemoButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function DemoButton({ onClick, disabled = false }: DemoButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2 px-4 border border-cyan-400/50 rounded-xl text-sm font-semibold text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Cargar credenciales de demo
    </button>
  );
}