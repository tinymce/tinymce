import { Fun } from '@ephox/katamari';
import { ExpandableBox, type ExpandableBoxProps } from 'oxide-components/components/expandablebox/ExpandableBox';
import { UniverseProvider } from 'oxide-components/contexts/universecontext/UniverseProvider';
import type { UniverseResources } from 'oxide-components/contexts/universecontext/UniverseTypes';
import { describe, it } from 'vitest';

import { renderVisual } from './utils/VisualTestUtils';

const chevron = `<svg width="24" height="24">
  <path d="M12 15.4 6.6 10a1 1 0 0 1 1.4-1.4l4 4 4-4A1 1 0 0 1 17.4 10L12 15.4Z" fill-rule="evenodd"></path>
</svg>`;

const resources: UniverseResources = {
  getIcon: Fun.constant(chevron),
  translate: Fun.identity,
};

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;

const renderBox = (args: ExpandableBoxProps): JSX.Element => (
  <UniverseProvider resources={resources}>
    <div style={{ width: '400px' }}>
      <ExpandableBox {...args} />
    </div>
  </UniverseProvider>
);

const expectBox = async (name: string, args: ExpandableBoxProps) => {
  const screen = renderVisual(renderBox(args));
  await screen.expectScreenshot(name);
};

describe('visual.ExpandableBoxTest', () => {
  it('TINYMCE-14867: renders the collapsed overflowing state', async () => {
    await expectBox('expandable-box-collapsed', {
      onToggle: Fun.noop,
      children: <p>{longText}</p>
    });
  });

  it('TINYMCE-14867: renders the expanded state', async () => {
    await expectBox('expandable-box-expanded', {
      expanded: true,
      onToggle: Fun.noop,
      children: <p>{longText}</p>
    });
  });

  it('TINYMCE-14867: renders the state without a toggle when the content fits', async () => {
    await expectBox('expandable-box-underflowing', {
      onToggle: Fun.noop,
      children: <p>Hello world</p>
    });
  });

  it('TINYMCE-14867: renders the collapsed state with a title', async () => {
    await expectBox('expandable-box-title-collapsed', {
      title: 'Suggested change',
      onToggle: Fun.noop,
      children: <p>{longText}</p>
    });
  });

  it('TINYMCE-14867: renders the expanded state with a title', async () => {
    await expectBox('expandable-box-title-expanded', {
      title: 'Suggested change',
      expanded: true,
      onToggle: Fun.noop,
      children: <p>{longText}</p>
    });
  });

  it('TINYMCE-14867: renders the collapsed state with a title and an icon', async () => {
    await expectBox('expandable-box-title-icon-collapsed', {
      title: 'Suggested change',
      icon: 'source-file',
      onToggle: Fun.noop,
      children: <p>{longText}</p>
    });
  });

  it('TINYMCE-14867: renders a long title with an icon truncated', async () => {
    await expectBox('expandable-box-title-icon-truncated', {
      title: 'A very long title that should be truncated with an ellipsis when it does not fit',
      icon: 'source-file',
      onToggle: Fun.noop,
      children: <p>{longText}</p>
    });
  });

  it('TINYMCE-14867: renders the state with a title and no toggle when the content fits', async () => {
    await expectBox('expandable-box-title-underflowing', {
      title: 'Suggested change',
      onToggle: Fun.noop,
      children: <p>Hello world</p>
    });
  });
});
