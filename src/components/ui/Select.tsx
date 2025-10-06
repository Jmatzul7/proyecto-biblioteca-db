interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  label,
  className = ''
}: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block  text-sm font-medium text-blue-200 mb-2">
          {label}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {placeholder && <option disabled value="">{placeholder}</option>}
        {options.map((option) => (
          <option className="text-gray-700" key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}