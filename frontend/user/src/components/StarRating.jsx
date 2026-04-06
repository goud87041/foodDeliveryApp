/**
 * Interactive or read-only star rating (1–5).
 */
export default function StarRating({ value, onChange, disabled, size = "md" }) {
  const stars = [1, 2, 3, 4, 5];
  const sz = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className={`flex gap-0.5 ${sz}`} role="group" aria-label="Rating">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled || !onChange}
          onClick={() => onChange?.(n)}
          className={`leading-none transition-transform hover:scale-110 disabled:cursor-default ${
            n <= value ? "text-orange-500" : "text-gray-200"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
