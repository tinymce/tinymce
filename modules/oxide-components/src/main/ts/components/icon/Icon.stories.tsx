import { Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from './Icon';
import type { IconProps } from './IconTypes';

const icons: Record<string, string> = {
  'chevron-down': '<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',
  'chevron-up': '<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>'
};

const iconResolver = (icon: string): string => Obj.get(icons, icon).getOrDie('Failed to get icon');

const meta = {
  title: 'components/Icon',
  parameters: {
    docs: {
      description: {
        component: `
An icon component that renders an SVG icon based on the provided icon name and resolver function.

## Usage

\`\`\`tsx
import { Icon } from 'oxide-components';

const iconResolver = (icon: string): string => {
  // Your icon resolution logic here
};

<Icon icon="chevron-down" resolver={iconResolver} dataTestId="chevron-down-icon" />
\`\`\`

## Example

\`\`\`tsx
<Icon icon="chevron-down" resolver={iconResolver} dataTestId="chevron-down-icon" />
\`\`\`

## How it works

The \`Icon\` component uses the provided \`resolver\` function to fetch the SVG markup for the specified \`icon\`. It then dangerously sets the inner HTML of a \`span\` element to render the SVG.
        `
      }
    }
  },
  component: Icon,
  tags: [ 'autodocs', 'skip-visual-testing' ],
  args: {
    resolver: iconResolver
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: IconProps): JSX.Element => {
  return (
    <div style={{ padding: '20px', border: '1px solid lightgray', display: 'inline-block' }}>
      <Icon {...args} />
    </div>
  );
};

const defaultProps: IconProps = {
  icon: 'chevron-down',
  resolver: iconResolver
};

export const Default: Story = {
  args: {
    ...defaultProps
  },
  render
};
