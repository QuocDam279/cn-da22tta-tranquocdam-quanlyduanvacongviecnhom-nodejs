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
  return (
    <label className={`field ${value ? "filled" : ""}`}>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
      />

      <span className="label-text">{label}</span>

      {icon && <div className="input-icon">{icon}</div>}

      {error && <div className="error-text">{error}</div>}
    </label>
  );
}
