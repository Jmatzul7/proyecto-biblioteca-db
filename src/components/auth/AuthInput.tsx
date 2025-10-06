interface AuthInputProps {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}

export default function AuthInput({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = true,
  disabled = false,
  icon,
  label
}: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-blue-200 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}