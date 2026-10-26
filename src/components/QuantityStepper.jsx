import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  max = 99,
}) {
  const handleInputChange = (event) => {
    const nextValue = Number.parseInt(event.target.value, 10);

    if (Number.isFinite(nextValue)) {
      onChange(Math.min(max, Math.max(min, nextValue)));
    }
  };

  return (
    <div className="quantity-stepper" role="group" aria-label={`Quantity for ${label}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease quantity for ${label}`}
      >
        <Minus size={13} aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        onFocus={(event) => event.target.select()}
        aria-label={`Quantity for ${label}`}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase quantity for ${label}`}
      >
        <Plus size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
