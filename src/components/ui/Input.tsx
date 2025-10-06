interface InputProps {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  min?: number | string;
  max?: number;
  step?: number;
}

export default function Input({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon,
  label,
  className = '',
  min,
  max,
  step
}: InputProps) {
  
  // Prevenir el cambio de valor con la rueda del mouse
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (type === 'number') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-blue-200 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onWheel={handleWheel} // ← ESTA ES LA SOLUCIÓN
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}