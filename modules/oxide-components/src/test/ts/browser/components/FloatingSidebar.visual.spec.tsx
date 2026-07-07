import { Fun } from '@ephox/katamari';
import * as FloatingSidebar from 'oxide-components/components/floatingsidebar/FloatingSidebar';
import type { FloatingSidebarProps } from 'oxide-components/components/floatingsidebar/FloatingSidebar';
import { IconButton } from 'oxide-components/components/iconbutton/IconButton';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import { describe, it } from 'vitest';

import { renderVisual } from './utils/VisualTestUtils';

const closeIcon = `<svg width="24" height="24">
    <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
  </svg>
`;

const resources = {
  getIcon: Fun.constant(closeIcon),
};

const args: FloatingSidebarProps = {
  isOpen: true,
  initialPosition: { x: '30px', y: '30px' },
  origin: 'top-right'
};

const sidebarContent = (
  <div style={{ padding: '12px' }}>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam.
    Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore,
    laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?
  </div>
);

describe('visual.FloatingSidebarTest', () => {
  it('renders the example state', async () => {
    const screen = renderVisual(
      <UniverseProvider resources={resources}>
        <FloatingSidebar.Root {...args}>
          <FloatingSidebar.Header>
            <div className='tox-sidebar-content__title'>Floating Header</div>
          </FloatingSidebar.Header>
          {sidebarContent}
        </FloatingSidebar.Root>
      </UniverseProvider>,
      { fullViewport: true }
    );
    await screen.expectScreenshot('floating-sidebar-example');
  });

  it('renders the button in header state', async () => {
    const screen = renderVisual(
      <UniverseProvider resources={resources}>
        <FloatingSidebar.Root {...args}>
          <FloatingSidebar.Header>
            <div className='tox-sidebar-content__title'>Floating Header</div>
            <div className='tox-sidebar-content__header-close-button'>
              <IconButton variant='naked' icon='close' onClick={Fun.noop} />
            </div>
          </FloatingSidebar.Header>
          {sidebarContent}
        </FloatingSidebar.Root>
      </UniverseProvider>,
      { fullViewport: true }
    );
    await screen.expectScreenshot('floating-sidebar-button-in-header');
  });
});
