import { Fun, Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';
import { useState } from 'react';

import { AutoResizingTextarea, Button, UniverseProvider } from '../../main';
import * as Dropdown from '../dropdown/Dropdown';
import { Icon } from '../icon/Icon';
import * as Menu from '../menu/Menu';

import * as Accordion from './Accordion';

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  'chevron-down': allIcons['chevron-down'],
  'chevron-up': allIcons['chevron-up']
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
    const [ selectedModel, setSelectedModel ] = useState('gpt-4');

    const modelNames: Record<string, string> = { 'gpt-4': 'GPT-4', 'gpt-3000': 'GPT-3000', 'claude': 'Claude' };
    const closeDropdown = () => document.querySelector<HTMLElement>('[popover]')?.hidePopover?.();

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
              <Dropdown.Root side="bottom" align="start" gap={2}>
                <Dropdown.Trigger>
                  <div className="tox-selectfield">
                    <button type="button" aria-haspopup="listbox">
                      {lengthOption === 'shorter' ? 'Shorter' : 'Longer'}
                    </button>
                    <Icon icon="chevron-down" />
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Content>
                  <Menu.Root>
                    <Menu.Item onAction={() => {
                      setLengthOption('shorter');
                      closeDropdown();
                    }}>
                      Shorter
                    </Menu.Item>
                    <Menu.Item onAction={() => {
                      setLengthOption('longer');
                      closeDropdown();
                    }}>
                      Longer
                    </Menu.Item>
                  </Menu.Root>
                </Dropdown.Content>
              </Dropdown.Root>
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
                <Dropdown.Root side="top" align="start" gap={2}>
                  <Dropdown.Trigger>
                    <button type="button" className="tox-accordion__model-button">
                      {modelNames[selectedModel] || 'Model'}
                      <Icon icon="chevron-down" />
                    </button>
                  </Dropdown.Trigger>
                  <Dropdown.Content>
                    <Menu.Root>
                      <Menu.Item onAction={() => {
                        setSelectedModel('gpt-4');
                        closeDropdown();
                      }}>
                        GPT-4
                      </Menu.Item>
                      <Menu.Item onAction={() => {
                        setSelectedModel('gpt-3000');
                        closeDropdown();
                      }}>
                        GPT-3000
                      </Menu.Item>
                      <Menu.Item onAction={() => {
                        setSelectedModel('claude');
                        closeDropdown();
                      }}>
                        Claude
                      </Menu.Item>
                    </Menu.Root>
                  </Dropdown.Content>
                </Dropdown.Root>
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

