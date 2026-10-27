/**
 * Splits a caption track into the lines shown one at a time over a video.
 *
 * Breaks after sentence-ending punctuation, so a line is always a whole
 * thought. Text with no sentence breaks comes back as one line, and blank text
 * as none.
 */
export function captionLines(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
