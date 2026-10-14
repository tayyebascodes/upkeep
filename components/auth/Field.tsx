interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function Field({ label, hint, id, name, ...props }: FieldProps) {
  const inputId = id ?? name;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={inputId} className="label">
          {label}
        </label>
        {hint && <span className="text-xs text-ink-subtle">{hint}</span>}
      </div>
      <input id={inputId} name={name} className="input" {...props} />
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{message}</p>;
}
