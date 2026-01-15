import type { Mouse } from 'playwright';
import type { BrowserCommand } from 'vitest/node';

// These are custom commands that I had to add here because vitest api is not exposing them directly.
// Hopefully in the future we can remove this file and use vitest api directly.

const mousedownCommand: BrowserCommand<Parameters<Mouse['down']>> = async (context, ...args) => {
  if (context.provider.name === 'playwright') {
    await context.page.mouse.down(...args);
  }
};

const mouseupCommand: BrowserCommand<Parameters<Mouse['up']>> = async (context, ...args) => {
  if (context.provider.name === 'playwright') {
    await context.page.mouse.up(...args);
  }
};

const mousemoveCommand: BrowserCommand<Parameters<Mouse['move']>> = async (context, x, y, options) => {
  if (context.provider.name === 'playwright') {
    // This is hacky, but I need to transform real coordinates into iframe coordinates.
    // The moment vitest will expose mousemove event, we can remove this hack.
    const iframe = context.page.locator('iframe[name="vitest-iframe"]');
    const { top, left } = await iframe.evaluate((el) => el.getBoundingClientRect());
    const scale = await iframe.evaluate((el) => Number(el.parentElement?.getAttribute('data-scale')));

    await context.page.mouse.move(left + (x * scale), top + (y * scale), options);
  }
};

export { mousedownCommand, mouseupCommand, mousemoveCommand };
