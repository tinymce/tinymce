import { Button } from 'oxide-components/components/button/Button';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import * as Mouse from './utils/Mouse';
import { renderVisual } from './utils/VisualTestUtils';

const VARIANTS = [ 'primary', 'secondary', 'outlined', 'naked' ] as const;

describe('visual.ButtonTest', () => {
  for (const variant of VARIANTS) {
    describe(`${variant} variant`, () => {
      it('renders the static states', async () => {
        const screen = renderVisual(
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant={variant}>Default</Button>
            <Button variant={variant} active={true}>Active prop true</Button>
            <Button variant={variant} disabled>Disabled</Button>
          </div>
        );
        await screen.expectScreenshot(`button-${variant}`);
      });

      it('renders the hover state', async () => {
        const screen = renderVisual(<Button variant={variant}>Hover</Button>);
        await userEvent.hover(screen.getByRole('button'));
        await screen.expectScreenshot(`button-${variant}-hover`);
      });

      it('renders the pressed state', async () => {
        const screen = renderVisual(<Button variant={variant}>Pressed</Button>);
        await userEvent.hover(screen.getByRole('button'));
        await Mouse.down();
        try {
          await screen.expectScreenshot(`button-${variant}-pressed`);
        } finally {
          await Mouse.up();
        }
      });

      it('renders the focused state', async () => {
        const screen = renderVisual(<Button variant={variant}>Focused</Button>);
        // Focus via keyboard: programmatic focus() leaves `:focus-visible` (and with it
        // the browser's native focus ring) dependent on the previous interaction
        // modality, which differs between runs on Firefox.
        await userEvent.tab();
        await expect.poll(() => document.activeElement).toBe(screen.getByRole('button').element());
        await screen.expectScreenshot(`button-${variant}-focused`);
      });
    });
  }
});
