// src/components/common/FormInput.jsx

export default function FormInput({
  name,
  type,
  value,
  onChange,
  label,
  error,
  icon
}) {
  const isFilled = value && value.length > 0;

  return (
    <div className="relative flex flex-col">
      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required
          className="w-full px-4 py-3.5 rounded-xl border border-slate-300 outline-none bg-white/90 text-slate-800 text-base transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 peer"
        />

        <span 
          className={`absolute left-4 text-slate-400 pointer-events-none transition-all duration-300 ${
            isFilled 
              ? "-top-2 text-xs bg-slate-100 px-2 rounded-md text-slate-700" 
              : "top-1/2 -translate-y-1/2 peer-focus:-top-2 peer-focus:text-xs peer-focus:bg-slate-100 peer-focus:px-2 peer-focus:rounded-md peer-focus:text-slate-700"
          }`}
        >
          {label}
        </span>

        {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{icon}</div>}
      </div>

      {error && (
        <div className="text-red-600 text-xs mt-1.5 ml-1">
          {error}
        </div>
      )}
    </div>
  );
}