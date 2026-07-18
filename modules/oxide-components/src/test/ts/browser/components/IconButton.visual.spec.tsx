import { Fun } from '@ephox/katamari';
import { IconButton } from 'oxide-components/components/iconbutton/IconButton';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import { describe, it } from 'vitest';

import { renderVisual } from './utils/VisualTestUtils';

/* eslint-disable max-len */
const leftArrowIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`;
/* eslint-enable max-len */

const resources = {
  getIcon: Fun.constant(leftArrowIcon),
};

const VARIANTS = [ 'primary', 'secondary', 'outlined', 'naked' ] as const;

describe('visual.IconButtonTest', () => {
  for (const variant of VARIANTS) {
    it(`renders the ${variant} state`, async () => {
      const screen = renderVisual(
        <UniverseProvider resources={resources}>
          <IconButton icon='left-arrow' variant={variant} />
        </UniverseProvider>
      );
      await screen.expectScreenshot(`icon-button-${variant}`);
    });
  }
});
