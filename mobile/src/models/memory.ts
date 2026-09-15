/** A saved moment in the care recipient's memory journal. */
export interface Memory {
  id: string;
  title: string;
  /** As the design prints it — "August 2026", not a full calendar date. */
  date: string;
  description: string;
}

/** The single sentence assistive technology announces for this memory. */
export function memorySemanticLabel(memory: Memory): string {
  return `Memory: ${memory.title}, ${memory.date}. ${memory.description}`;
}
