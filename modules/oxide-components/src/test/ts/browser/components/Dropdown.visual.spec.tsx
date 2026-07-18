import { Button } from 'oxide-components/components/button/Button';
import * as Dropdown from 'oxide-components/components/dropdown/Dropdown';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderVisual } from './utils/VisualTestUtils';

const SIDES = [ 'top', 'bottom', 'left', 'right' ] as const;
const ALIGNS = [ 'start', 'center', 'end' ] as const;

describe('visual.DropdownTest', () => {
  for (const side of SIDES) {
    for (const align of ALIGNS) {
      it(`renders the open dropdown on side ${side} with align ${align}`, async () => {
        const screen = renderVisual(
          <Dropdown.Root side={side} align={align} gap={8}>
            <Dropdown.Trigger>
              <Button variant='secondary'>Click to toggle</Button>
            </Dropdown.Trigger>
            <Dropdown.Content>
              <div contentEditable={true} style={{ width: '200px', height: '100px' }}>Hello I am the content</div>
            </Dropdown.Content>
          </Dropdown.Root>,
          { fullViewport: true }
        );

        await userEvent.click(screen.getByRole('button'));
        await expect.poll(() =>
          document.querySelector('[popover]:popover-open')?.checkVisibility() === true
        ).toBe(true);

        await screen.expectScreenshot(`dropdown-${side}-${align}`);
      });
    }
  }
});
