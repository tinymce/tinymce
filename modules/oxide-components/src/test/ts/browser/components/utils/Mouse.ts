import type { Mouse } from 'playwright';
import { commands, userEvent } from 'vitest/browser';

// This is a Util file containing functions that are currently unavailable in userEvent API.
// See: https://github.com/vitest-dev/vitest/issues/8190
// See: https://github.com/vitest-dev/vitest/issues/7836
// Hopefully in the future we can remove this file and use userEvent API directly.

declare module 'vitest/browser' {
  interface BrowserCommands {
    mousedownCommand: (...args: Parameters<Mouse['down']>) => Promise<void>;
    mouseupCommand: (...args: Parameters<Mouse['up']>) => Promise<void>;
    mousemoveCommand: (...args: Parameters<Mouse['move']>) => Promise<void>;
  }
}

const down = async (...args: Parameters<Mouse['down']>): Promise<void> =>
  commands.mousedownCommand(...args);

const up = async (...args: Parameters<Mouse['up']>): Promise<void> =>
  commands.mouseupCommand(...args);

const move = async (...args: Parameters<Mouse['move']>): Promise<void> =>
  commands.mousemoveCommand(...args);

const dragTo = async (element: HTMLElement, position: { top: number; left: number }, options?: { startPosition: { x: number; y: number }}): Promise<void> => {
  const startPosition = options?.startPosition ?? { x: 0, y: 0 };
  await userEvent.hover(element, { position: { ...startPosition }});
  await commands.mousedownCommand();
  await commands.mousemoveCommand(position.left, position.top);
  await commands.mouseupCommand();
};

export { move, down, up, dragTo };
