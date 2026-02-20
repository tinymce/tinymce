import { Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip, UniverseProvider } from 'oxide-components/main';

const icons: Record<string, string> = {
  close: '<svg width="24" height="24"><path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path></svg>'
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOrDie('Failed to get icon')
};

const meta = {
  title: 'components/tooltip',
  component: (props) =>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <div title='hover' style={{ border: '1px solid #000' }}>Hover Me</div>
      </Tooltip.Trigger>
      <Tooltip.Content text={props.text} />
    </Tooltip.Root>,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs', 'hover-visual-testing', 'skip-visual-testing' ],
  decorators: [
    (Story) => (
      <div className='tox-ai'>
        <UniverseProvider resources={mockUniverse}>
          <Story />
        </UniverseProvider>
      </div>
    )
  ],
} satisfies Meta<{ text: string }>;

export default meta;
type Story = StoryObj<{ text: string }>;

export const StandardTooltip: Story = {
  args: {
    text: 'Message'
  },
};
