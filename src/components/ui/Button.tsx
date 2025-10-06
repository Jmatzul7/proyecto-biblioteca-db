interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export default function Button({
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  children,
  className = '',
  icon
}: ButtonProps) {
  const baseClasses = "flex items-center justify-center px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-white",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    danger: "bg-red-500 hover:bg-red-400 text-white"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {loading && (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}