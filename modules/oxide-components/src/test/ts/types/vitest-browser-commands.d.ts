import type { Mouse } from 'playwright';

declare module 'vitest/internal/browser' {
  interface BrowserCommands {
    mousedownCommand: (...args: Parameters<Mouse['down']>) => Promise<void>;
    mouseupCommand: (...args: Parameters<Mouse['up']>) => Promise<void>;
    mousemoveCommand: (...args: Parameters<Mouse['move']>) => Promise<void>;
  }
}

declare module 'vitest/browser' {
  interface BrowserCommands {
    mousedownCommand: (...args: Parameters<Mouse['down']>) => Promise<void>;
    mouseupCommand: (...args: Parameters<Mouse['up']>) => Promise<void>;
    mousemoveCommand: (...args: Parameters<Mouse['move']>) => Promise<void>;
  }
}
