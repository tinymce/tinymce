import { Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';
import { useEffect, useState } from 'react';

import { Button, ExpandableBox, IconButton, UniverseProvider } from '../../main';
import * as Bem from '../../utils/Bem';
import { Icon } from '../icon/Icon';
import * as Profile from '../profile/Profile';

import * as Card from './Card';

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  'checkmark': allIcons.checkmark,
  'close': allIcons.close,
  'chevron-down': allIcons['chevron-down'],
  'chevron-up': allIcons['chevron-up']
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOr(`<svg id="${name}"></svg>`)
};

// eslint-disable-next-line max-len
const AVATAR_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%234A90E2"/%3E%3Ctext x="18" y="24" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif"%3EJM%3C/text%3E%3C/svg%3E';

const meta = {
  title: 'components/Card',
  component: Card.Root,
  decorators: [
    (Story) => (
      <UniverseProvider resources={mockUniverse}>
        <div className="tox">
          <Story />
        </div>
      </UniverseProvider>
    )
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Card component is a reusable compound component for displaying content with actions.

## Features
- **Compound Component Pattern**: Flexible composition with Root, Header, HeaderContent, HeaderActions, Body, and Actions
- **State Management**: Supports selected and resolution states (accepted/rejected)
- **Controlled Component**: Parent manages state via props
- **Accessibility**: Proper ARIA attributes and keyboard support

## Usage Pattern

The component uses a compound component pattern with these parts:
- \`Card.Root\`: Container managing state and click handlers
- \`Card.Header\`: Title/status section
- \`Card.HeaderContent\`: Left-side header content (e.g. Profile). When present, header uses a row layout.
- \`Card.HeaderActions\`: Right-side header action buttons with visibility modes (\`hover\` default, \`focus\`, \`always\`)
- \`Card.Body\`: Main content area
- \`Card.Actions\`: Bottom button container

## Integration

Works seamlessly with other oxide-components:
- **Button** / **IconButton**: For action buttons
- **Profile**: For user info in HeaderContent
- **ExpandableBox**: For long content
- **Icon**: For status indicators
        `
      }
    }
  },
  tags: [ 'autodocs' ],
  args: {},
} satisfies Meta<typeof Card.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Default Card**

A basic card with header, body content, and action buttons.
This demonstrates the minimal setup needed for a functional card.
Buttons use Secondary style with icons as specified, positioned on the left with 8px gap.

**Click the card** to see the selected state (2px blue border).

Spacing: 12px padding from card edge, 12px gap between sections.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState(false);

    return (
      <div style={{ width: '316px' }}>
        <Card.Root selected={selected} onSelect={() => setSelected(!selected)}>
          <Card.Header>
            Review Suggestion
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>Barcelona is football&apos;s most exceptional institution club, combining sporting excellence with cultural significance.</p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined">
              <Icon icon="close" />
              Skip
            </Button>
            <Button variant="outlined">
              <Icon icon="checkmark" />
              Apply
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>
    );
  }
};

export const LongContent: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card with Long Content**

Demonstrates how to handle lengthy content using the ExpandableBox component.
The content is initially collapsed and can be expanded by clicking the Expand button.

**Click the card** to see the selected state.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState(false);
    const [ expanded, setExpanded ] = useState(false);

    return (
      <div style={{ width: '316px' }}>
        <Card.Root selected={selected} onSelect={() => setSelected(!selected)}>
          <Card.Header title="Lengthy Review" />
          <Card.Body>
            <ExpandableBox
              maxHeight={80}
              expanded={expanded}
              onToggle={() => setExpanded(!expanded)}
            >
              <p style={{ margin: 0 }}>
                Barcelona is football&apos;s most exceptional institution club, combining sporting excellence
                with cultural significance in ways no other club matches. The club has been home to
                football&apos;s greatest talents: Pelé called it his &quot;second home,&quot; Maradona dazzled at Camp Nou,
                and Messi—arguably the greatest player ever—spent his entire prime there. Barcelona&apos;s La Masia
                academy is football&apos;s most successful youth system, producing world-class talents like Xavi,
                Iniesta, Puyol, and countless others who embody the club&apos;s values.
              </p>
            </ExpandableBox>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined">
              <Icon icon="close" />
              Skip
            </Button>
            <Button variant="outlined">
              <Icon icon="checkmark" />
              Apply
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>
    );
  }
};

export const WithActionButtons: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card with Action Buttons**

Shows a card with action buttons using the proper Secondary style and icons.
All buttons use the outlined variant with text color icons.

**Click the card** to select it.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState(false);

    return (
      <div style={{ width: '316px' }}>
        <Card.Root selected={selected} onSelect={() => setSelected(!selected)}>
          <Card.Header>
            Review Suggestion
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>
              Barcelona is football&apos;s most exceptional institution club, combining sporting excellence with cultural significance.
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined">
              <Icon icon="close" />
              Skip
            </Button>
            <Button variant="outlined">
              <Icon icon="checkmark" />
              Apply
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>
    );
  }
};

export const CardStates: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card Visual States**

Demonstrates the visual states of cards with status labels:
- **Default**: No selection, normal appearance
- **Applied**: Card with "APPLIED" label showing completed state
- **Skipped**: Card with "SKIPPED" label showing dismissed state

**Keyboard Navigation:**
- Arrow keys to navigate between cards
- Enter/Space to select the focused card
- Tab to access buttons within cards
        `
      }
    }
  },
  render: () => {
    const [ focusedIndex, setFocusedIndex ] = useState(0);
    const [ selectedIndex, setSelectedIndex ] = useState<number | undefined>(undefined);

    return (
      <div style={{ width: '316px' }}>
        <Card.CardListController
          focusedIndex={focusedIndex}
          onFocusedIndexChange={setFocusedIndex}
          selectedIndex={selectedIndex}
          onSelectCard={setSelectedIndex}
        >
          <Card.CardList ariaLabel="Review suggestions with different states">
            <Card.Root index={0}>
              <Card.Header>
                Review Suggestion
              </Card.Header>
              <Card.Body>
                <p style={{ margin: 0 }}>This card has no status yet.</p>
              </Card.Body>
              <Card.Actions>
                <Button variant="outlined" onClick={(e) => e.stopPropagation()}>
                  <Icon icon="close" />
                  Skip
                </Button>
                <Button variant="outlined" onClick={(e) => e.stopPropagation()}>
                  <Icon icon="checkmark" />
                  Apply
                </Button>
              </Card.Actions>
            </Card.Root>

            <Card.Root index={1} hasDecision={true}>
              <Card.Header>
                <div className={Bem.element('tox-card', 'header-label')}>Applied</div>
              </Card.Header>
              <Card.Body>
                <p style={{ margin: 0 }}>This suggestion has been applied.</p>
              </Card.Body>
              <Card.Actions>
                <Button variant="outlined" onClick={(e) => e.stopPropagation()}>
                  <Icon icon="close" />
                  Revert
                </Button>
              </Card.Actions>
            </Card.Root>

            <Card.Root index={2} hasDecision={true}>
              <Card.Header>
                <div className={Bem.element('tox-card', 'header-label')}>Skipped</div>
              </Card.Header>
              <Card.Body>
                <p style={{ margin: 0 }}>This suggestion has been skipped.</p>
              </Card.Body>
              <Card.Actions>
                <Button variant="outlined" onClick={(e) => e.stopPropagation()}>
                  <Icon icon="close" />
                  Revert
                </Button>
              </Card.Actions>
            </Card.Root>
          </Card.CardList>
        </Card.CardListController>
      </div>
    );
  }
};

export const SidebarDensity: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Sidebar Density Demonstration**

Shows multiple review cards in a sidebar-like container (440px width) to demonstrate:
- Card density and spacing (12px gap)
- Scrolling behavior with multiple cards
- Hover effects
- Click/selection interaction
- **Arrow key navigation** between cards
- Tab key navigation to buttons

This simulates how cards would appear in a sidebar-style UI with full keyboard support.
        `
      }
    }
  },
  render: () => {
    const [ focusedIndex, setFocusedIndex ] = useState(0);
    const [ selectedIndex, setSelectedIndex ] = useState<number | undefined>(undefined);

    const reviews = [
      { id: 1, title: 'Grammar Fix', content: 'Change "institution club" to "club institution"' },
      { id: 2, title: 'Spelling Correction', content: 'Correct "tiki-taka" spelling' },
      { id: 3, title: 'Clarity Improvement', content: 'Simplify complex sentence structure' },
      { id: 4, title: 'Style Enhancement', content: 'Add transition words for better flow' },
      { id: 5, title: 'Fact Check', content: 'Verify the 2008-2012 era claim' },
    ];

    return (
      <div
        style={{
          width: '440px',
          maxHeight: '500px',
          overflowY: 'auto',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px'
        }}
      >
        <Card.CardListController
          focusedIndex={focusedIndex}
          onFocusedIndexChange={setFocusedIndex}
          selectedIndex={selectedIndex}
          onSelectCard={setSelectedIndex}
        >
          <Card.CardList ariaLabel="Review suggestions">
            {reviews.map((review, index) => (
              <Card.Root key={review.id} index={index}>
                <Card.Header title={review.title} />
                <Card.Body>
                  <p style={{ margin: 0, fontSize: '14px' }}>{review.content}</p>
                </Card.Body>
                <Card.Actions>
                  <Button variant="outlined" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(undefined);
                  }}>
                    <Icon icon="close" />
                    Skip
                  </Button>
                  <Button variant="outlined" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}>
                    <Icon icon="checkmark" />
                    Apply
                  </Button>
                </Card.Actions>
              </Card.Root>
            ))}
          </Card.CardList>
        </Card.CardListController>
      </div>
    );
  }
};

export const KeyboardNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Keyboard Navigation with CardList**

Demonstrates the CardList component with full keyboard navigation support:
- **Arrow Keys**: Navigate between cards (Up/Down)
- **Enter/Space**: Select the focused card
- **Tab**: Move focus in/out of the list
- **Roving Tabindex**: Only the focused card is in tab order

This follows WCAG accessibility guidelines and the listbox pattern.

**Try it:**
1. Tab to focus the first card
2. Use arrow keys to navigate
3. Press Enter/Space to select
        `
      }
    }
  },
  render: () => {
    const [ focusedIndex, setFocusedIndex ] = useState(0);
    const [ selectedIndex, setSelectedIndex ] = useState<number | undefined>(undefined);

    const reviews = [
      { id: 1, title: 'Grammar Fix', content: 'Change "institution club" to "club institution"' },
      { id: 2, title: 'Spelling Correction', content: 'Correct "tiki-taka" spelling' },
      { id: 3, title: 'Clarity Improvement', content: 'Simplify complex sentence structure' },
      { id: 4, title: 'Style Enhancement', content: 'Add transition words for better flow' },
      { id: 5, title: 'Fact Check', content: 'Verify the 2008-2012 era claim' },
    ];

    return (
      <div style={{ width: '316px' }}>
        <Card.CardListController
          focusedIndex={focusedIndex}
          onFocusedIndexChange={setFocusedIndex}
          selectedIndex={selectedIndex}
          onSelectCard={setSelectedIndex}
        >
          <Card.CardList ariaLabel="Review suggestions" cycles={false}>
            {reviews.map((review, index) => (
              <Card.Root key={review.id} index={index}>
                <Card.Header title={review.title} />
                <Card.Body>
                  <p style={{ margin: 0, fontSize: '14px' }}>{review.content}</p>
                </Card.Body>
                <Card.Actions>
                  <Button variant="outlined" onClick={(e) => {
                    e.stopPropagation(); setSelectedIndex(undefined);
                  }}>
                    <Icon icon="close" />
                    Skip
                  </Button>
                  <Button variant="outlined" onClick={(e) => {
                    e.stopPropagation(); setSelectedIndex(index);
                  }}>
                    <Icon icon="checkmark" />
                    Apply
                  </Button>
                </Card.Actions>
              </Card.Root>
            ))}
          </Card.CardList>
        </Card.CardListController>
      </div>
    );
  }
};

export const SkeletonLoading: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Skeleton Loading State with Transition**

Demonstrates the \`loading\` prop on Card.Root that internally handles skeleton state.
The card automatically transitions from skeleton to loaded content when \`loading\` changes from \`true\` to \`false\`.

This matches the Suggested Edits pattern where the card container remains the same but content switches between skeleton and loaded state.

**Try it:** The card shows skeleton for 2 seconds, then transitions to show the actual content.
        `
      }
    }
  },
  render: () => {
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div style={{ width: '316px' }}>
        <Card.CardList>
          <Card.Root loading={loading} index={0}>
            <Card.Body>
              <p style={{ margin: 0 }}>
                Barcelona is football's most exceptional institution club, combining sporting excellence with cultural significance.
              </p>
            </Card.Body>
            <Card.Actions>
              <Button variant="outlined">
                <Icon icon="close" />
                Skip
              </Button>
              <Button variant="outlined">
                <Icon icon="checkmark" />
                Apply
              </Button>
            </Card.Actions>
          </Card.Root>
        </Card.CardList>
      </div>
    );
  }
};

export const WithHeaderActions: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card with Header Actions and Profile**

Demonstrates the new unified card design with:
- \`Card.HeaderContent\`: Left-side content (Profile component with avatar, name, timestamp)
- \`Card.HeaderActions\`: Right-side action buttons with hover visibility
- Action buttons appear on hover/focus by default (\`visibilityMode="hover"\`)

This pattern is used across TinyMCE AI and Suggested Edits for a consistent user experience.

**Try it:** Hover over the card to see the header action buttons appear.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState(false);

    return (
      <div style={{ width: '316px' }}>
        <Card.Root selected={selected} onSelect={() => setSelected(!selected)}>
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image
                  src={AVATAR_URL}
                  alt="John Mac Giolla..."
                />
                <Profile.Body>
                  <Profile.Heading>John Mac Giolla...</Profile.Heading>
                  <Profile.Subheading>May 18, 9:12 AM</Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.HeaderContent>
            <Card.HeaderActions visibilityMode="hover">
              <IconButton variant="naked" icon="close" aria-label="Reject" />
              <IconButton variant="naked" icon="checkmark" aria-label="Accept" />
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>
              Modified text
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined" className="tox-button--stretch">
              Provide feedback
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>
    );
  }
};

export const HeaderActionsAlwaysVisible: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card with Always Visible Header Actions**

Same as the previous story, but with \`visibilityMode="always"\` on HeaderActions.
The action buttons remain visible at all times instead of only on hover.

This is useful when action visibility is important for discoverability.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState(false);

    return (
      <div style={{ width: '316px' }}>
        <Card.Root selected={selected} onSelect={() => setSelected(!selected)}>
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image
                  src={AVATAR_URL}
                  alt="Jane Smith"
                />
                <Profile.Body>
                  <Profile.Heading>Jane Smith</Profile.Heading>
                  <Profile.Subheading>May 19, 2:45 PM</Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.HeaderContent>
            <Card.HeaderActions visibilityMode="always">
              <IconButton variant="naked" icon="close" aria-label="Reject" />
              <IconButton variant="naked" icon="checkmark" aria-label="Accept" />
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>
              Added new content
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined" className="tox-button--stretch">
              Provide feedback
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>
    );
  }
};

export const HeaderActionsOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card with Header Actions Only**

Demonstrates the edge case where \`Card.HeaderActions\` is used without \`Card.HeaderContent\`.
The actions are automatically aligned to the right side of the header.

This is useful for simple cards that only need action buttons without user info or labels.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState(false);

    return (
      <div style={{ width: '316px' }}>
        <Card.Root selected={selected} onSelect={() => setSelected(!selected)}>
          <Card.Header>
            <Card.HeaderActions visibilityMode="always">
              <IconButton variant="naked" icon="close" aria-label="Reject" />
              <IconButton variant="naked" icon="checkmark" aria-label="Accept" />
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>
              Quick action card without header content
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined" className="tox-button--stretch">
              More options
            </Button>
          </Card.Actions>
        </Card.Root>
      </div>
    );
  }
};
