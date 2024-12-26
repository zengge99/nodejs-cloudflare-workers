import { Miniflare } from "miniflare";
import { vi } from 'vitest';

vi.mock('crypto', () => ({
  randomUUID: () => "test-uuid"
}));

// Setup global test environment
globalThis.crypto = {
  randomUUID: () => "test-uuid",
};

// Setup Miniflare environment
const mf = new Miniflare({
  modules: true,
  scriptPath: "src/index.js",
  bindings: {
    ENVIRONMENT: "test",
  },
});

// Make Request and Response available globally
globalThis.Request = Request;
globalThis.Response = Response;
