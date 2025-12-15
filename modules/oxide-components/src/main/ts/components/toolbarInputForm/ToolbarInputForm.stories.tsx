/* eslint-disable max-len */
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ToolbarInputForm, type ToolbarInputFormProps } from './ToolbarInputForm';

const meta = {
  title: 'components/ToolbarInputForm',
  component: ToolbarInputForm,
  argTypes: {
    label: {
      description: 'Input field label.'
    },
    placeholder: {
      description: 'Placeholder text for input field.'
    },
    onSubmit: {
      description: 'On submit function.',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: ``
      }
    }
  },
  tags: [ 'autodocs' ],
} satisfies Meta<typeof ToolbarInputForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: ToolbarInputFormProps): JSX.Element => {
  return <ToolbarInputForm onSubmit={args.onSubmit} placeholder={args.placeholder} label={args.label}></ToolbarInputForm>;
};

export const Example: Story = {
  args: {
    label: 'Some input:',
    placeholder: 'value...',
    onSubmit: (value) => {
      window.alert(`Form submitted with value: ${value}`);
    }
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
};

export const Url: Story = {
  args: {
    label: 'URL',
    placeholder: 'http://',
    onSubmit: (value) => {
      window.alert(`Form submitted with value: ${value}`);
    }
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render
};
