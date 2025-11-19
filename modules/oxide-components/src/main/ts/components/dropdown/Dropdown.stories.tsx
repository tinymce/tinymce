import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Dropdown from './Dropdown';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Dropdown',
  component: Dropdown.Root,
  argTypes: {
    side: {
      description: 'On which side of the trigger button should the content container appear',
      value: 'top',
      options: [ 'top', 'bottom', 'left', 'right' ]
    },
    align: {
      description: 'Should the content container be aligned to the start, center or end of the trigger button.',
      value: 'start',
      options: [ 'start', 'center', 'end' ]
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `A dropdown component. Contains a button and an anchored container that can be used for creating menus.`
      }
    }
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof Dropdown.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: Dropdown.DropdownProps): JSX.Element => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Dropdown.Root side={args.side} align={args.align}>
        <Dropdown.TriggerButton>Click me to toggle dropdown</Dropdown.TriggerButton>
        <Dropdown.Content>
          <div style={{ width: '400px', height: '300px', border: '2px solid lightgrey', borderRadius: '8px' }}></div>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
};

export const TopStart: Story = {
  args: {
    side: 'top',
    align: 'start',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const TopCenter: Story = {
  args: {
    side: 'top',
    align: 'center',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const TopEnd: Story = {
  args: {
    side: 'top',
    align: 'end',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const BottomStart: Story = {
  args: {
    side: 'bottom',
    align: 'start',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const BottomCenter: Story = {
  args: {
    side: 'bottom',
    align: 'center',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const BottomEnd: Story = {
  args: {
    side: 'bottom',
    align: 'end',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const LeftStart: Story = {
  args: {
    side: 'left',
    align: 'start',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const LeftCenter: Story = {
  args: {
    side: 'left',
    align: 'center',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const LeftEnd: Story = {
  args: {
    side: 'left',
    align: 'end',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const RightStart: Story = {
  args: {
    side: 'right',
    align: 'start',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const RightCenter: Story = {
  args: {
    side: 'right',
    align: 'center',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

export const RightEnd: Story = {
  args: {
    side: 'right',
    align: 'end',
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};

