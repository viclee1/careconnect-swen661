/** A tracked medication and whether today's dose has been taken. */
export interface Medicine {
  id: string;
  name: string;
  /** Dosage and instructions as the design prints them — "5 mg — 1 tablet with food". */
  dosage: string;
  /** Time of day as the design prints it — "8:30 am". */
  time: string;
  taken: boolean;
}

/**
 * The single sentence assistive technology announces for this medicine.
 * Status is stated in words — "Taken" / "Not taken" — never colour alone.
 */
export function medicineSemanticLabel(medicine: Medicine): string {
  return `${medicine.name}, ${medicine.dosage}, ${medicine.time}. ${
    medicine.taken ? 'Taken' : 'Not taken'
  }`;
}
