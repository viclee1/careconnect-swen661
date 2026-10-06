import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * A tiny JSON file on disk, used for the two things the desktop client has to
 * remember between launches: the accessibility preferences and the window's
 * size and position.
 *
 * Deliberately hand-written rather than pulled from `electron-store`. The whole
 * requirement is "read and write one small object", the dependency would be the
 * only runtime dependency in the app, and a store that silently throws on a
 * corrupt file is exactly the failure this app cannot afford — a user who
 * cannot hear the application has no fallback if it refuses to open. Every read
 * below degrades to the fallback instead.
 */
export interface JsonStore<T> {
  read(): T;
  write(value: T): void;
  clear(): void;
  /** Absolute path of the backing file, for diagnostics and tests. */
  readonly path: string;
}

export function createJsonStore<T extends object>(
  directory: string,
  fileName: string,
  fallback: T,
): JsonStore<T> {
  const path = join(directory, fileName);

  return {
    path,

    read(): T {
      try {
        const raw = readFileSync(path, 'utf8');
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          return fallback;
        }
        return parsed as T;
      } catch {
        // Missing file, unreadable file, or malformed JSON all mean the same
        // thing to the caller: there is nothing stored yet.
        return fallback;
      }
    },

    write(value: T): void {
      try {
        mkdirSync(dirname(path), { recursive: true });
        // Written to a sibling and renamed into place, so a crash midway
        // through cannot leave a half-written file that the next launch then
        // has to recover from.
        const temporary = `${path}.tmp`;
        writeFileSync(temporary, JSON.stringify(value, null, 2), 'utf8');
        renameSync(temporary, path);
      } catch {
        // A preference that fails to persist is a nuisance; a crash on a
        // read-only disk is not acceptable. The in-memory value still applies
        // for this session.
      }
    },

    clear(): void {
      this.write(fallback);
    },
  };
}
