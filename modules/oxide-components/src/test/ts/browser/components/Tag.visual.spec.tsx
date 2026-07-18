import { Fun } from '@ephox/katamari';
import { Tag, UniverseProvider, type UniverseResources } from 'oxide-components/main';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderVisual } from './utils/VisualTestUtils';

const resources: UniverseResources = {
  getIcon: Fun.constant(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path fill="#222F3E" fill-rule="evenodd" d="M11.723 5.62 9.356 8l2.367 2.38a.95.95 0 0 1-1.343 1.343L8 9.356l-2.38 2.367a.95.95 0 0 1-1.343-1.343L6.644 8 4.277 5.62A.95.95 0 0 1 5.62 4.277L8 6.644l2.38-2.367a.95.95 0 0 1 1.343 1.343Z"/>
  </svg>
`),
};

const renderTag = () => (
  <UniverseProvider resources={resources}>
    <Tag closeable={true} link={false} label='Value' onClose={Fun.noop} />
  </UniverseProvider>
);

describe('visual.TagTest', () => {
  it('renders the closable tag state', async () => {
    const screen = renderVisual(renderTag());
    await screen.expectScreenshot('tag-closable-tag');
  });

  it('renders the focused closable tag state', async () => {
    const screen = renderVisual(renderTag());
    const tag = screen.container.querySelector('.tox-tag') as HTMLElement;
    // Focus the tag via keyboard. Pointer/programmatic focus leaves `:focus-visible`
    // off, and headless Firefox does not paint plain `:focus` styling into screenshots
    // (the ring only renders when `:focus-visible` applies). The tag ships with
    // tabindex="-1", so make it keyboard-reachable for the test — the attribute has no
    // visual effect.
    tag.tabIndex = 0;
    await userEvent.tab();
    await expect.poll(() => document.activeElement).toBe(tag);
    await screen.expectScreenshot('tag-focused-closable-tag');
  });
});
