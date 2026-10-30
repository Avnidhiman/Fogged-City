import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Web Audio isn't available in jsdom; the game's synth is cosmetic, so silence it in tests.
vi.mock('../utils/audioSystem', () => ({
  audioSystem: new Proxy({}, { get: () => () => {} }),
}));

// jsdom doesn't implement media playback.
beforeEach(() => {
  localStorage.clear();
  // Emulate real browser semantics: `paused` flips when play()/pause() run.
  Object.defineProperty(window.HTMLMediaElement.prototype, 'paused', { configurable: true, get() { return this._paused !== false; } });
  window.HTMLMediaElement.prototype.play = vi.fn(function () { this._paused = false; this.dispatchEvent(new Event('play')); return Promise.resolve(); });
  window.HTMLMediaElement.prototype.pause = vi.fn(function () { this._paused = true; this.dispatchEvent(new Event('pause')); });
});
afterEach(() => cleanup());
