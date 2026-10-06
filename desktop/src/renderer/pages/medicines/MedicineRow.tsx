import { Icon } from '../../components/Icon';
import type { Medicine } from '../../models/medicine';

/**
 * One medicine, ticked off by checking it.
 *
 * Built on a real `<input type="checkbox">` inside its `<label>`, so the whole
 * row is the click target and the platform supplies the rest: Tab reaches it,
 * Space toggles it, the screen reader says "tick box, checked", and Windows
 * High Contrast draws it. The mobile client's `accessibilityRole="checkbox"`
 * is the same idea; on the desktop the native element does it without help.
 *
 * The checkbox is left visible rather than re-drawn: a native box is what
 * Windows High Contrast knows how to render. Taken-ness is shown three ways —
 * the ticked box, the struck-through name and the word "Taken" — never by
 * colour alone.
 */
export function MedicineRow({
  medicine,
  onToggle,
}: {
  medicine: Medicine;
  onToggle: () => void;
}) {
  return (
    <label
      className={`medicine-row${medicine.taken ? ' medicine-row--taken' : ''}`}
      data-testid={`medicine-${medicine.id}`}
    >
      <input
        type="checkbox"
        className="medicine-row__input"
        checked={medicine.taken}
        onChange={onToggle}
      />
      <span className="info-card__icon" aria-hidden="true">
        <Icon name="medicines" size={24} />
      </span>
      <span className="medicine-row__text">
        <span className="medicine-row__name">{medicine.name}</span>
        <span className="medicine-row__details">
          {medicine.dosage} · {medicine.time}
        </span>
      </span>
      {/* The checkbox already carries this state to a screen reader. */}
      <span className="medicine-row__state" aria-hidden="true">
        {medicine.taken ? <Icon name="check" size={18} /> : null}
        {medicine.taken ? 'Taken' : 'Not taken'}
      </span>
    </label>
  );
}
