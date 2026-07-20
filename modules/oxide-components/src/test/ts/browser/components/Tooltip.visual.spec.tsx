import { Fun } from '@ephox/katamari';
import * as Tooltip from 'oxide-components/components/tooltip/Tooltip';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderVisual } from './utils/VisualTestUtils';

const TOOLTIP_APPEARANCE_TIMEOUT_MS = 1_000;

const resources = {
  getIcon: Fun.constant(`<svg width="24" height="24">
    <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
  </svg>`),
};

const renderTooltip = (props: { text: string; oversizeContent: boolean; alwaysShow: boolean }) => (
  <UniverseProvider resources={resources}>
    <Tooltip.Root showCondition={props.alwaysShow ? 'always' : 'overflow'}>
      <Tooltip.Trigger>
        <div
          title='hover'
          style={{
            border: '1px solid #000',
            maxWidth: '200px',
            maxHeight: '200px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
        >
          {props.oversizeContent ? 'Hover Me, but Big'.repeat(50) : 'Hover Me'}
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content text={props.text} />
    </Tooltip.Root>
  </UniverseProvider>
);

const expectTooltip = async (name: string, props: { text: string; oversizeContent: boolean; alwaysShow: boolean }) => {
  const screen = renderVisual(renderTooltip(props), { extraClasses: [ 'tox-ai' ], fullViewport: true });
  await userEvent.hover(screen.getByTitle('hover'));
  await expect.element(screen.getByText('Message'), { timeout: TOOLTIP_APPEARANCE_TIMEOUT_MS }).toBeVisible().catch(Fun.noop);
  await screen.expectScreenshot(name);
};

describe('visual.TooltipTest', () => {
  it('renders the standard tooltip state', async () => {
    await expectTooltip('tooltip-standard-tooltip', {
      text: 'Message',
      oversizeContent: false,
      alwaysShow: true
    });
  });

  it('renders the overflowing tooltip state', async () => {
    await expectTooltip('tooltip-overflowing-tooltip', {
      text: 'Message',
      oversizeContent: true,
      alwaysShow: false
    });
  });
});
