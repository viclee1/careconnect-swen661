// Build-time settings from Vite. Kept in one module so the components that use
// them can be loaded by Jest, which cannot parse `import.meta` (see the stub in
// __mocks__/env.ts, mapped in jest.config.cjs).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
