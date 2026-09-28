import { Fun, Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UniverseProvider } from 'oxide-components/contexts/universecontext/UniverseProvider';
import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';

import { ExpandableBox, type ExpandableBoxProps } from './ExpandableBox';

const icons: Record<string, string> = {
  'chevron-down': '<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',
  'chevron-up': '<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>',
  'source-file': '<svg width="16" height="16"><path d="M4.333 2h5.61L13 5.057v7.61c0 .735-.598 1.333-1.333 1.333H4.333A1.335 1.335 0 0 1 3 12.667V3.333C3 2.6 3.598 2 4.333 2Zm0 10.667h7.334V6H9V3.333H4.333v9.334Z" fill-rule="evenodd"/></svg>'
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOrDie('Failed to get icon'),
  translate: Fun.identity
};

const meta = {
  title: 'components/ExpandableBox',
  component: ExpandableBox,
  decorators: [
    (Story) => (
      <UniverseProvider resources={mockUniverse}>
        <Story />
      </UniverseProvider>
    )
  ],
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs' ],
  args: { },
} satisfies Meta<typeof ExpandableBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: ExpandableBoxProps): JSX.Element => {
  const [{ expanded }, updateArgs ] = useArgs();

  const setExpanded = (expanded: boolean) => {
    updateArgs({ expanded });
  };

  return <div style={{
    display: 'flex',
    alignItems: 'stretch',
    boxSizing: 'border-box',
    flexDirection: 'column',
    gap: '8px',
    width: '400px'
  }}>
    <ExpandableBox {...args} expanded={expanded} onToggle={() => setExpanded(!expanded)}/>
  </div>;
};

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const WideThing = () => (
  <span style={{ width: '600px', height: '20px', backgroundColor: 'lightgray', display: 'inline-block' }}>
    This is a wide thing
  </span>
);

const defaultsProps: ExpandableBoxProps = {
  maxHeight: 80,
  collapseLabel: 'Collapse',
  expandLabel: 'Expand',
  children: <p>{longText}</p>
};

export const Overflowing: Story = {
  args: {
    ...defaultsProps,
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
};

export const OverflowingWithScroll: Story = {
  args: {
    ...defaultsProps,
    children: <><p>{longText}<WideThing /></p><p>{longText}<WideThing /></p></>
  },
  render
};

export const OverflowingHorizontallyOnly: Story = {
  args: {
    ...defaultsProps,
    children: <p>Hello world<WideThing /></p>
  },
  render
};

export const WithTitle: Story = {
  args: {
    ...defaultsProps,
    title: 'Title',
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
};

export const WithTitleAndIcon: Story = {
  args: {
    ...defaultsProps,
    title: 'Title',
    icon: 'source-file',
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
};

export const WithLongTitleAndIcon: Story = {
  args: {
    ...defaultsProps,
    title: 'A very long title that should be truncated with an ellipsis when it does not fit',
    icon: 'source-file',
    children: <><p>{longText}</p><p>{longText}</p></>
  },
  render
};

export const Underflowing: Story = {
  args: {
    ...defaultsProps,
    children: <p>Hello world</p>
  },
  render
};

export const DynamicContent: Story = {
  args: {
    ...defaultsProps,
  },
  render: (args) => {
    const [ expanded, setExpanded ] = useState(false);

    const [ paragraphs, setParagraphs ] = useState(1);

    return <div style={{
      display: 'flex',
      alignItems: 'stretch',
      boxSizing: 'border-box',
      flexDirection: 'column',
      gap: '8px',
      width: '400px'
    }}>
      <ExpandableBox {...args} expanded={expanded} onToggle={() => setExpanded(!expanded)}>
        {Array.from({ length: paragraphs }).map((_, i) => <p key={i}>Paragraph {i + 1}</p>)}
      </ExpandableBox>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button type="button" className="tox-button" onClick={() => setParagraphs(paragraphs + 1)}>Add</button>
        <button type="button" className="tox-button" onClick={() => setParagraphs(Math.max(1, paragraphs - 1))}>Remove</button>
      </div>
    </div>;
  }
};
