import * as Bem from 'oxide-components/utils/Bem';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, expect } from 'vitest';
import { page, type ScreenshotMatcherOptions } from 'vitest/browser';
import { render, type RenderResult } from 'vitest-browser-react';

import * as Mouse from './Mouse';

/*
 * Helpers for `*.visual.spec.tsx` files.
 *
 * Visual specs run only in the `visual` vitest project, where screenshots are always
 * rendered by Linux browsers (a Docker Playwright browser server locally, the CI
 * container on Jenkins) — see `visual-regression-test.mjs`. They are excluded from the
 * `browser` project so they never run on developer machines with mismatching rendering.
 */

export interface VisualRenderOptions {
  // Extra classes applied to the screenshot container alongside the Oxide `tox` class.
  readonly extraClasses?: string[];
  // Size the container to the full viewport and center the content. Use this for
  // components that render top-layer popovers or position themselves against the
  // viewport: element screenshots only capture the container's box, so the container
  // must span the area the component can occupy.
  readonly fullViewport?: boolean;
}

export interface VisualRenderResult extends RenderResult {
  readonly expectScreenshot: (name: string, options?: ScreenshotMatcherOptions) => Promise<void>;
}

let activeContainer: HTMLElement | null = null;

beforeEach(async () => {
  // Normalize the pointer and input modality before each test:
  // - Firefox decides `:focus-visible` (and with it the native focus ring) from the
  //   most recent user interaction, so keyboard usage in one test would otherwise
  //   leak into the next test's screenshots. A pointer interaction resets it; tests
  //   that want the keyboard focus ring switch modality explicitly with userEvent.tab().
  // - Parking the pointer in the viewport corner also prevents stray `:hover` states
  //   left behind by the previous test's interactions.
  await Mouse.move(1, 1);
  await Mouse.down();
  await Mouse.up();
});

afterEach(() => {
  activeContainer?.remove();
  activeContainer = null;
  document.body.removeAttribute('style');
});

export const renderVisual = (ui: ReactElement, options: VisualRenderOptions = {}): VisualRenderResult => {
  document.body.style.margin = '0';

  const container = document.createElement('div');
  container.className = [ Bem.block('tox'), ...options.extraClasses ?? [] ].join(' ');
  if (options.fullViewport === true) {
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.boxSizing = 'border-box';
    container.style.display = 'grid';
    container.style.placeContent = 'center';
  } else {
    // Shrink-wrap the content, with enough padding to capture shadows and focus rings.
    container.style.display = 'inline-block';
    container.style.padding = '16px';
  }
  document.body.appendChild(container);
  activeContainer = container;

  const result = render(ui, { container });

  const expectScreenshot = async (name: string, options?: ScreenshotMatcherOptions) => {
    await document.fonts.ready;
    await expect.element(page.elementLocator(container)).toMatchScreenshot(name, options);
  };

  return { ...result, expectScreenshot };
};
