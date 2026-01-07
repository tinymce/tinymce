import { Fun, Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { AutoResizingTextarea, Button, UniverseProvider } from '../../main';

import * as Accordion from './Accordion';

const icons: Record<string, string> = {
  'chevron-down': '<svg width="10" height="10"><path d="M8.7 2.2c.3-.3.8-.3 1 0 .4.4.4.9 0 1.2L5.7 7.8c-.3.3-.9.3-1.2 0L.2 3.4a.8.8 0 0 1 0-1.2c.3-.3.8-.3 1.1 0L5 6l3.7-3.8Z" fill-rule="nonzero"/></svg>',
  'chevron-up': '<svg width="10" height="10"><path d="M8.7 7.8 5 4 1.3 7.8c-.3.3-.8.3-1 0a.8.8 0 0 1 0-1.2l4.1-4.4c.3-.3.9-.3 1.2 0l4.2 4.4c.3.3.3.9 0 1.2-.3.3-.8.3-1.1 0Z" fill-rule="nonzero"/></svg>'
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOrDie('Failed to get icon')
};

const meta = {
  title: 'components/Accordion',
  component: Accordion.Root,
  decorators: [
    (Story) => (
      <UniverseProvider resources={mockUniverse}>
        <Story />
      </UniverseProvider>
    )
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Accordion component provides collapsible content sections with full keyboard navigation and accessibility support.

## Features
- **Controlled & Uncontrolled modes**: Use \`defaultExpanded\` for uncontrolled or \`expanded\`+\`onExpandedChange\` for controlled
- **Single or multi-expand**: Control with \`allowMultiple\` prop
- **Full keyboard support**: Arrow keys, Home, End for navigation
- **Accessibility**: Proper ARIA attributes, semantic headings, focus management
- **Customizable**: Icon position, heading levels, disabled states

## Usage Pattern

The component uses a compound component pattern with two parts:
- \`Accordion.Root\`: Container that manages expansion state
- \`Accordion.Item\`: Individual collapsible sections

## Accessibility

Each accordion item includes:
- Semantic heading elements (configurable via \`headingLevel\`)
- Proper ARIA attributes (\`aria-expanded\`, \`aria-controls\`, \`aria-labelledby\`)
- Keyboard navigation following WAI-ARIA Accordion pattern
- Focus management for intuitive navigation
        `
      }
    }
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
  args: { },
} satisfies Meta<typeof Accordion.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Barebone: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Native HTML Accordion**

This example uses native HTML \`<details>\` and \`<summary>\` elements.
Simple and works without JavaScript, but lacks advanced features.
        `
      }
    }
  },
  render: () => {
    return (
      <div style={{ width: '400px' }}>
        <details>
          <summary>Proofread</summary>
          <div style={{ padding: '8px' }}>
            <p>Check the text for errors in grammar, spelling, and punctuation.</p>
            <button>Run</button>
          </div>
        </details>

        <details style={{ marginTop: '8px' }}>
          <summary>Adjust length</summary>
          <div style={{ padding: '8px' }}>
            <p>Shorten or lengthen the text as needed.</p>
            <select>
              <option value="shorter">Shorter</option>
              <option value="longer">Longer</option>
            </select>
            <button style={{ marginLeft: '8px' }}>Run</button>
          </div>
        </details>

        <details style={{ marginTop: '8px' }}>
          <summary>Custom</summary>
          <div style={{ padding: '8px' }}>
            <p>Enter a custom command for a specific review.</p>
            <textarea placeholder="Type a custom command" style={{ width: '100%', minHeight: '60px' }}></textarea>
            <div style={{ marginTop: '8px' }}>
              <button>Run</button>
              <button style={{ marginLeft: '8px' }}>Model</button>
            </div>
          </div>
        </details>
      </div>
    );
  }
};

export const Styled: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Styled Accordion for TinyMCE AI**

This is the enhanced accordion component used in the TinyMCE AI plugin with full styling and features.

**Features demonstrated:**
- **Single vs Multi-expand**: Toggle \`allowMultiple\` prop to enable multiple items to be expanded simultaneously (default is single-expand mode)
- **Keyboard Navigation**:
  - **Enter/Space**: Toggle accordion item
  - **Arrow Down/Up**: Navigate between headers
  - **Home/End**: Jump to first/last item
- **Controlled State**: Manage expansion state programmatically
- **Icon Position**: Icon can be at start (default) or end of header
- **Disabled State**: Individual items can be disabled
- **Accessibility**: Full ARIA support, semantic headings, focus management

Try using keyboard navigation and toggling the controls below.
        `
      }
    }
  },
  args: {
    allowMultiple: false,
    defaultExpanded: [ 'item1' ]
  },
  argTypes: {
    allowMultiple: {
      control: 'boolean',
      description: 'Allow multiple items to be expanded at once'
    },
    defaultExpanded: {
      control: 'object',
      description: 'Array of item IDs expanded by default'
    }
  },
  render: (args) => {
    const [ lengthOption, setLengthOption ] = useState('longer');

    return (
      <div className="tox" style={{ width: '400px' }}>
        <Accordion.Root {...args}>
          <Accordion.Item id="item1" title="Proofread" iconPosition="end">
            <div className="tox-form__group">
              <p>Check the text for errors in grammar, spelling, and punctuation.</p>
              <Button variant="primary">Run</Button>
            </div>
          </Accordion.Item>
          <Accordion.Item id="item2" title="Adjust length" iconPosition="end">
            <div className="tox-form__group">
              <p>Shorten or lengthen the text as needed.</p>
              {/* This select need to be a combobox TINY-13450 */}
              <select value={lengthOption} onChange={(e) => setLengthOption(e.target.value)}>
                <option value="shorter">Shorter</option>
                <option value="longer">Longer</option>
              </select>
              <Button variant="primary">Run</Button>
            </div>
          </Accordion.Item>
          <Accordion.Item id="item3" title="Custom" iconPosition="end">
            <div className="tox-form__group">
              <p>Enter a custom command for a specific review.</p>
              <AutoResizingTextarea
                value=""
                placeholder="Type a custom command"
                onChange={Fun.noop}
              />
              <div className="tox-button-group">
                <Button variant="primary">Run</Button>
                <Button variant="secondary">Model</Button>
              </div>
            </div>
          </Accordion.Item>
          <Accordion.Item id="item4" title="Disabled Example" iconPosition="end" disabled>
            <div className="tox-form__group">
              <p>This item is disabled.</p>
            </div>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    );
  }
};

