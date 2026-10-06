/**
 * @jest-environment node
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createJsonStore } from '../jsonStore';

describe('createJsonStore', () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'careconnect-store-'));
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it('returns the fallback before anything has been written', () => {
    const store = createJsonStore(directory, 'settings.json', { a: 1 });
    expect(store.read()).toEqual({ a: 1 });
  });

  it('round-trips a value', () => {
    const store = createJsonStore<{ a: number }>(directory, 'settings.json', { a: 1 });
    store.write({ a: 42 });
    expect(store.read()).toEqual({ a: 42 });
    expect(JSON.parse(readFileSync(store.path, 'utf8'))).toEqual({ a: 42 });
  });

  it('creates the directory it writes into', () => {
    const store = createJsonStore(join(directory, 'nested', 'deeper'), 'settings.json', {});
    store.write({ a: 1 });
    expect(store.read()).toEqual({ a: 1 });
  });

  it('falls back rather than throwing on malformed JSON', () => {
    // A user who cannot hear the application has no fallback if it refuses to
    // open, so a corrupt preference file must degrade, never crash.
    const store = createJsonStore(directory, 'settings.json', { a: 1 });
    writeFileSync(store.path, '{ this is not json', 'utf8');
    expect(store.read()).toEqual({ a: 1 });
  });

  it('falls back when the file holds something that is not an object', () => {
    const store = createJsonStore(directory, 'settings.json', { a: 1 });
    writeFileSync(store.path, '[1, 2, 3]', 'utf8');
    expect(store.read()).toEqual({ a: 1 });

    writeFileSync(store.path, 'null', 'utf8');
    expect(store.read()).toEqual({ a: 1 });
  });

  it('leaves no temporary file behind after a write', () => {
    // The write goes to a sibling and is renamed into place, so a crash midway
    // cannot leave a half-written file for the next launch to recover from.
    const store = createJsonStore(directory, 'settings.json', {});
    store.write({ a: 1 });
    expect(() => readFileSync(`${store.path}.tmp`, 'utf8')).toThrow();
  });

  it('swallows a write to a path it cannot create', () => {
    // A preference that fails to persist is a nuisance; a crash on a read-only
    // disk is not acceptable.
    const store = createJsonStore('/proc/definitely-not-writable', 'settings.json', { a: 1 });
    expect(() => store.write({ a: 2 })).not.toThrow();
    expect(store.read()).toEqual({ a: 1 });
  });

  it('resets to the fallback on clear', () => {
    const store = createJsonStore<{ a: number }>(directory, 'settings.json', { a: 1 });
    store.write({ a: 99 });
    store.clear();
    expect(store.read()).toEqual({ a: 1 });
  });
});
