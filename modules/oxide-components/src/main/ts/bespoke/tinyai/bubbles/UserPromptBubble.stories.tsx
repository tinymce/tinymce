import type { Meta, ReactRenderer, StoryObj } from '@storybook/react-vite';
import { classes } from 'oxide-components/utils/Styles';
import type { PartialStoryFn } from 'storybook/internal/csf';

import { UserPromptBubble } from './UserPromptBubble';

const meta = {
  decorators: [
    (Story: PartialStoryFn<ReactRenderer>): JSX.Element => <div className={classes([ 'tox-ai' ])}><Story /></div>
  ],
  title: 'bespoke/tinyai/UserPromptBubble',
  component: UserPromptBubble,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs' ],
} satisfies Meta<typeof UserPromptBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleUserPromptBubble: Story = {
  args: {
    prompt: 'Value'
  },
};
