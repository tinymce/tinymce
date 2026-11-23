import { Arr, Fun, Obj, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';
import { AutoResizingTextarea } from 'oxide-components/components/autoresizingtextarea/AutoResizingTextarea';
import { Button } from 'oxide-components/components/button/Button';
import { ExpandableBox } from 'oxide-components/components/expandablebox/ExpandableBox';
import { Icon } from 'oxide-components/components/icon/Icon';
import { IconButton } from 'oxide-components/components/iconbutton/IconButton';
import { UniverseProvider } from 'oxide-components/contexts/universecontext/UniverseProvider';
import * as Bem from 'oxide-components/utils/Bem';
import * as FocusHelpers from 'oxide-components/utils/FocusHelpers';
import { useEffect, useState } from 'react';

import * as Profile from '../profile/Profile';

import * as Card from './Card';

interface AiChange {
  readonly label: string;
  readonly before: string;
  readonly removed?: string;
  readonly added?: string;
  readonly after: string;
}

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  'checkmark': allIcons.checkmark,
  'close': allIcons.close,
  'chevron-down': allIcons['chevron-down'],
  'chevron-up': allIcons['chevron-up'],
  'feedback': allIcons.feedback
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOr(`<svg id="${name}"></svg>`),
  translate: Fun.identity
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
- **Compound Component Pattern**: Flexible composition with Root, Header, HeaderContent, HeaderActions, Body, Actions, and Expansion
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

## Feedback/Comment Threads

For feedback and comment threads, click the card to reveal the thread content:
1. **Click card** → Shows divider + existing replies + textarea
2. **Focus textarea** → Shows Cancel/Save buttons
3. **Click Cancel** → Hides buttons, keeps textarea visible

The feedback count is shown in the \`Profile.Subheading\` with an icon.

## Integration

Works seamlessly with other oxide-components:
- **Button** / **IconButton**: For action buttons
- **Profile**: For user info in HeaderContent
- **ExpandableBox**: For long content
- **AutoResizingTextarea**: For feedback/comment editors
- **Icon**: For status indicators

## Advanced: Card.Expansion

For custom expandable sections, use the \`Card.Expansion\` compound components:
- \`Card.Expansion\`: Expandable section wrapper (controlled)
- \`Card.ExpansionTrigger\`: Button that toggles the expansion
- \`Card.ExpansionContent\`: Animated collapsible content region
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

export const GroupedCards: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Cards grouped under a heading**

\`Card.CardGroup\` holds any number of cards of a list under one title, for a list whose cards come from more
than one source. The cards stay descendants of the list, so the arrow key navigation and the focused index run
across the groups as one sequence rather than restarting in each of them.

Scroll the list to see the headings: each one sits in the flow until it would scroll out of view, then pins
to the top of the list. A heading is pinned only within its own group, so the next one pushes it out as it
arrives rather than stacking under it.

A heading can carry a \`status\`, which joins the accessible name of the group so a screen reader announces it
with the title. It is muted text at the far end of the heading, already formatted so the caller owns the
wording — skip or apply the cards of a group to watch it fall to \`0 pending\`.
        `
      }
    }
  },
  render: () => {
    const [ focusedIndex, setFocusedIndex ] = useState(0);
    const [ selectedIndex, setSelectedIndex ] = useState<number | undefined>(undefined);
    const [ decisions, setDecisions ] = useState<Record<string, 'skip' | 'apply'>>({});

    const groups = [
      { title: 'Real Madrid article', cards: [ 'One', 'Two', 'Three' ] },
      { title: 'Barcelona article', cards: [ 'Four', 'Five', 'Six' ] },
      { title: 'Athletic Bilbao article', cards: [ 'Seven', 'Eight', 'Nine' ] }
    ];

    const decide = (card: string, decision: 'skip' | 'apply') =>
      setDecisions((current) => ({ ...current, [card]: decision }));

    const countPending = (cards: string[]) => Arr.filter(cards, (card) => !Obj.has(decisions, card)).length;

    let index = -1;

    return (
      <div style={{ width: '316px', height: '400px', overflowY: 'auto' }}>
        <Card.CardListController
          focusedIndex={focusedIndex}
          onFocusedIndexChange={setFocusedIndex}
          selectedIndex={selectedIndex}
          onSelectCard={setSelectedIndex}
        >
          <Card.CardList ariaLabel="Suggestions of two documents">
            {groups.map((group) => (
              <Card.CardGroup
                key={group.title}
                title={group.title}
                status={`${countPending(group.cards)} pending`}
              >
                {group.cards.map((card) => {
                  index++;

                  return (
                    <Card.Root key={card} index={index} hasDecision={Obj.has(decisions, card)}>
                      <Card.Body>
                        <p style={{ margin: 0 }}>{`Suggestion ${card}`}</p>
                      </Card.Body>
                      <Card.Actions>
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            decide(card, 'skip');
                          }}
                        >
                          <Icon icon="close" />
                          Skip
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            decide(card, 'apply');
                          }}
                        >
                          <Icon icon="checkmark" />
                          Apply
                        </Button>
                      </Card.Actions>
                    </Card.Root>
                  );
                })}
              </Card.CardGroup>
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

export const ResolutionButton: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card with a Decision**

A card with a decision shows \`Card.ResolutionButton\` in its \`Card.HeaderActions\`: a greyed tick for an accepted card
and a greyed cross for a rejected one. Hovering or focusing the button swaps the icon for its label so the decision can
be reverted. The label is passed in already translated, and the button forwards every button prop.

The card has no \`Card.HeaderContent\`, so the button is aligned to the right of the header.

**Try it:** Hover over the tick or the cross.
        `
      }
    }
  },
  render: () => (
    <div style={{ width: '440px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Arr.map([ 'accept', 'reject' ] as const, (resolution) => (
        <Card.Root key={resolution} hasDecision={true}>
          <Card.Header>
            <Card.HeaderActions visibilityMode="always">
              <Card.ResolutionButton resolution={resolution} label="Revert" />
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>
              Barcelona is football&apos;s most exceptional institution club.
            </p>
          </Card.Body>
        </Card.Root>
      ))}
    </div>
  )
};

const sidebarStyle = {
  width: '440px',
  boxSizing: 'border-box',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  backgroundColor: '#f5f5f5',
  borderRadius: '6px'
} as const;

const aiChanges: AiChange[] = [
  {
    label: 'Added text',
    before: '...Since the 1950s, Scandinavian ',
    added: 'has',
    after: ' architecture offered a calm, humane alternative to postwar...'
  },
  {
    label: 'Deleted text',
    before: '...and industrial methods. ',
    removed: 'In many ways',
    after: ' it has been about people first, and the designers sought to...'
  },
  {
    label: 'Replaced text',
    before: '...and industrial methods. It ',
    removed: 'was',
    added: 'has been',
    after: ' about people first, and the designers sought to make...'
  },
  {
    label: 'Replaced text',
    before: 'about people first, and the designers ',
    removed: 'tried',
    added: 'sought',
    after: ' to make buildings that feels comfortable and'
  }
];

const inlineHighlightStyle = { padding: '0 2px' } as const;

const renderChangeSnippet = ({ before, removed, added, after }: AiChange) => (
  <p style={{ margin: 0 }}>
    {before}
    {Type.isNonNullable(removed) && (
      <del
        className={Bem.element('tox-card', 'highlight', { deleted: true })}
        style={{ ...inlineHighlightStyle, textDecoration: 'line-through', borderBottomColor: 'var(--tox-private-color-error, #c00)' }}
      >
        {removed}
      </del>
    )}
    {Type.isNonNullable(added) && (
      <ins
        className={Bem.element('tox-card', 'highlight', { added: true })}
        style={{ ...inlineHighlightStyle, textDecoration: 'none', borderBottomColor: 'var(--tox-private-color-success, #78ab46)' }}
      >
        {added}
      </ins>
    )}
    {after}
  </p>
);

const renderChangeLabel = (label: string) => (
  <span style={{ fontWeight: 'bold', fontSize: 'var(--tox-private-font-size-sm, 14px)' }}>{label}</span>
);

export const AiReviewCardPending: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**AI Review Card: Pending**

How a TinyMCE AI review card will look. The header says what kind of change it is ("Added text", "Deleted text",
"Replaced text"), and the body shows the change in its surrounding text. There is no avatar.
The header actions use the same Skip and Apply buttons as Suggested Edits: they appear on hover, and stay visible
once the card is selected. The header always holds the label, so the card doesn't resize when the buttons appear.

\`Card.Highlight\` renders a block element, so it can't highlight text inside a sentence. The inline change here is
built in the story from \`ins\` and \`del\` elements with the highlight classes, to show the layout. The real card
renders its own change snippet. The 14px bold header label is styled in the story for the same reason.

**Try it:** Hover over a card, then click one to select it.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState<number | undefined>(1);

    return (
      <div style={sidebarStyle}>
        {Arr.map(aiChanges, (change, index) => (
          <Card.Root key={index} selected={selected === index} onSelect={() => setSelected(index)}>
            <Card.Header>
              <Card.HeaderContent>{renderChangeLabel(change.label)}</Card.HeaderContent>
              <Card.HeaderActions visibilityMode={selected === index ? 'always' : 'hover'}>
                <IconButton variant="secondary" icon="close" aria-label="Skip" />
                <IconButton variant="secondary" icon="checkmark" aria-label="Apply" />
              </Card.HeaderActions>
            </Card.Header>
            <Card.Body>{renderChangeSnippet(change)}</Card.Body>
          </Card.Root>
        ))}
      </div>
    );
  }
};

export const AiReviewCardResolved: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**AI Review Card: Resolved**

A card that has a decision shows a greyed tick (applied) or cross (skipped) through \`Card.ResolutionButton\`, in place of
Skip and Apply. Hovering or focusing it swaps the icon for the revert label.

Resolving a card doesn't add an avatar or an "Applied" or "Skipped" label: the header keeps the change type and only
the button changes.
        `
      }
    }
  },
  render: () => {
    const resolutions = [ 'accept', 'reject', 'accept', 'accept' ] as const;

    return (
      <div style={sidebarStyle}>
        {Arr.map(aiChanges, (change, index) => (
          <Card.Root key={index} hasDecision={true}>
            <Card.Header>
              <Card.HeaderContent>{renderChangeLabel(change.label)}</Card.HeaderContent>
              <Card.HeaderActions visibilityMode="always">
                <Card.ResolutionButton resolution={resolutions[index]} label="Revert" />
              </Card.HeaderActions>
            </Card.Header>
            <Card.Body>{renderChangeSnippet(change)}</Card.Body>
          </Card.Root>
        ))}
      </div>
    );
  }
};

export const AiReviewCardList: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**AI Review Card: List**

A list of review cards in a 440px sidebar, with each card's decision kept in state so the whole flow can be tried:
skip or apply a card to resolve it, then revert it from the greyed button.

Cards are reached with the arrow keys, and Tab from a focused card moves onto its buttons. After a button is used,
focus goes back to the card.
        `
      }
    }
  },
  render: () => {
    const [ focusedIndex, setFocusedIndex ] = useState(0);
    const [ selectedIndex, setSelectedIndex ] = useState<number | undefined>(undefined);
    const [ decisions, setDecisions ] = useState<Record<string, Card.CardResolution>>({});

    const focusCard = (button: HTMLElement) =>
      FocusHelpers.focusAncestor(SugarElement.fromDom(button), Bem.blockSelector('tox-card'));

    const decide = (index: number, decision: Card.CardResolution, button: HTMLElement) => {
      focusCard(button);
      setDecisions((current) => ({ ...current, [String(index)]: decision }));
    };

    const revert = (index: number, button: HTMLElement) => {
      focusCard(button);
      setDecisions((current) => Obj.filter(current, (_, key) => key !== String(index)));
    };

    return (
      <div style={{ ...sidebarStyle, maxHeight: '500px', overflowY: 'auto' }}>
        <Card.CardListController
          focusedIndex={focusedIndex}
          onFocusedIndexChange={setFocusedIndex}
          selectedIndex={selectedIndex}
          onSelectCard={setSelectedIndex}
        >
          <Card.CardList ariaLabel="AI review suggestions">
            {Arr.map(aiChanges, (change, index) => {
              const decision = Obj.get(decisions, String(index));

              return (
                <Card.Root key={index} index={index} hasDecision={decision.isSome()}>
                  <Card.Header>
                    <Card.HeaderContent>{renderChangeLabel(change.label)}</Card.HeaderContent>
                    {decision.fold(
                      () => (
                        <Card.HeaderActions visibilityMode={selectedIndex === index ? 'always' : 'hover'}>
                          <IconButton variant="secondary" icon="close" aria-label="Skip" onClick={(event) => decide(index, 'reject', event.currentTarget)} />
                          <IconButton variant="secondary" icon="checkmark" aria-label="Apply" onClick={(event) => decide(index, 'accept', event.currentTarget)} />
                        </Card.HeaderActions>
                      ),
                      (resolution) => (
                        <Card.HeaderActions visibilityMode="always">
                          <Card.ResolutionButton resolution={resolution} label="Revert" onClick={(event) => revert(index, event.currentTarget)} />
                        </Card.HeaderActions>
                      )
                    )}
                  </Card.Header>
                  <Card.Body>{renderChangeSnippet(change)}</Card.Body>
                </Card.Root>
              );
            })}
          </Card.CardList>
        </Card.CardListController>
      </div>
    );
  }
};

export const ExpansionBasic: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card.Expansion API Example**

Demonstrates the \`Card.Expansion\` compound components:
- \`Card.Expansion\`: Wrapper with controlled state
- \`Card.ExpansionTrigger\`: Button that toggles expansion (requires single interactive child)
- \`Card.ExpansionContent\`: Animated collapsible content region

**Try it:** Click "View feedback (2)" to expand, click again to collapse.
        `
      }
    }
  },
  render: () => {
    const [ open, setOpen ] = useState(false);

    return (
      <div style={{ width: '316px' }}>
        <Card.Root>
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="John Mac Giolla..." />
                <Profile.Body>
                  <Profile.Heading>John Mac Giolla...</Profile.Heading>
                  <Profile.Subheading>
                    May 18, 9:12 AM • 2 <Icon icon="feedback" aria-label="feedback" />
                  </Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.HeaderContent>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>Modified text with suggested changes</p>
          </Card.Body>
          <Card.Expansion open={open} onOpenChange={setOpen}>
            <Card.ExpansionTrigger>
              <Button variant="outlined" className="tox-button--stretch">
                View feedback (2)
              </Button>
            </Card.ExpansionTrigger>
            <Card.ExpansionContent>
              <div>
                <Profile.Root>
                  <Profile.Image src={AVATAR_URL} alt="Sarah Chen" />
                  <Profile.Body>
                    <Profile.Heading>Sarah Chen</Profile.Heading>
                    <Profile.Subheading>May 18, 10:30 AM</Profile.Subheading>
                  </Profile.Body>
                </Profile.Root>
                <p style={{ margin: '8px 0 0' }}>This change looks good to me.</p>
              </div>
              <div>
                <Profile.Root>
                  <Profile.Image src={AVATAR_URL} alt="Mike Torres" />
                  <Profile.Body>
                    <Profile.Heading>Mike Torres</Profile.Heading>
                    <Profile.Subheading>May 18, 11:15 AM</Profile.Subheading>
                  </Profile.Body>
                </Profile.Root>
                <p style={{ margin: '8px 0 0' }}>Could we keep the original phrasing instead?</p>
              </div>
            </Card.ExpansionContent>
          </Card.Expansion>
        </Card.Root>
      </div>
    );
  }
};

export const ExpansionProvideFeedback: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card — Provide Feedback (Suggested Edits)**

Click the card to reveal the feedback composer. Focus the textarea to show action buttons.

**Try it:** Click the card → focus textarea → Cancel hides buttons, keeps textarea visible.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState(true);
    const [ threadOpen, setThreadOpen ] = useState(false);
    const [ actionsVisible, setActionsVisible ] = useState(false);
    const [ feedback, setFeedback ] = useState('');

    return (
      <div style={{ width: '316px' }}>
        <Card.Root
          selected={selected}
          onSelect={() => {
            setSelected(!selected);
            setThreadOpen(!threadOpen);
          }}
        >
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="John Mac Giolla..." />
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
            <p style={{ margin: 0 }}>Modified text</p>
          </Card.Body>
          {threadOpen && (
            <>
              <Card.Divider />
              <div
                style={{ paddingBottom: '16px' }}
                onFocusCapture={() => setActionsVisible(true)}
                onClick={(e) => e.stopPropagation()}
              >
                <AutoResizingTextarea
                  value={feedback}
                  onChange={setFeedback}
                  placeholder="Provide feedback..."
                />
                {actionsVisible && (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeedback('');
                        setActionsVisible(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeedback('');
                        setActionsVisible(false);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card.Root>
      </div>
    );
  }
};

export const ExpansionCommentReplies: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card — Comment Thread (Comments)**

Click the card to reveal existing replies and a composer. Focus the textarea to show action buttons.

**Try it:** Click card → see replies + composer → focus textarea → action buttons appear.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState(true);
    const [ threadOpen, setThreadOpen ] = useState(false);
    const [ actionsVisible, setActionsVisible ] = useState(false);
    const [ reply, setReply ] = useState('');

    return (
      <div style={{ width: '316px' }}>
        <Card.Root
          selected={selected}
          onSelect={() => {
            setSelected(!selected);
            setThreadOpen(!threadOpen);
          }}
        >
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="Jane Smith" />
                <Profile.Body>
                  <Profile.Heading>Jane Smith</Profile.Heading>
                  <Profile.Subheading>
                    May 19, 2:45 PM • 2 <Icon icon="feedback" aria-label="comments" />
                  </Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.HeaderContent>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>
              Can we clarify this section before publishing?
            </p>
          </Card.Body>

          {threadOpen && (
            <>
              <Card.Divider />
              <div
                style={{ paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                onFocusCapture={() => setActionsVisible(true)}
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <Profile.Root>
                    <Profile.Image src={AVATAR_URL} alt="Alex Rivera" />
                    <Profile.Body>
                      <Profile.Heading>Alex Rivera</Profile.Heading>
                      <Profile.Subheading>May 19, 3:10 PM</Profile.Subheading>
                    </Profile.Body>
                  </Profile.Root>
                  <p style={{ margin: '8px 0 0' }}>Agreed — the wording is ambiguous.</p>
                </div>
                <div>
                  <Profile.Root>
                    <Profile.Image src={AVATAR_URL} alt="Sam Lee" />
                    <Profile.Body>
                      <Profile.Heading>Sam Lee</Profile.Heading>
                      <Profile.Subheading>May 19, 4:02 PM</Profile.Subheading>
                    </Profile.Body>
                  </Profile.Root>
                  <p style={{ margin: '8px 0 0' }}>I can take a pass on a rewrite.</p>
                </div>

                <AutoResizingTextarea
                  value={reply}
                  onChange={setReply}
                  placeholder="Add comment..."
                />
                {actionsVisible && (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReply('');
                        setActionsVisible(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReply('');
                        setActionsVisible(false);
                      }}
                    >
                      Comment
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card.Root>
      </div>
    );
  }
};

export const ExpansionFeedbackReplies: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Card — Feedback Thread (Suggested Edits)**

Click the card to reveal existing feedback and a composer. Focus the textarea to show action buttons.

**Try it:** Click card → see feedback + composer → focus textarea → action buttons appear.
        `
      }
    }
  },
  render: () => {
    const [ selected, setSelected ] = useState(true);
    const [ threadOpen, setThreadOpen ] = useState(false);
    const [ actionsVisible, setActionsVisible ] = useState(false);
    const [ reply, setReply ] = useState('');

    return (
      <div style={{ width: '316px' }}>
        <Card.Root
          selected={selected}
          onSelect={() => {
            setSelected(!selected);
            setThreadOpen(!threadOpen);
          }}
        >
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="John Mac Giolla..." />
                <Profile.Body>
                  <Profile.Heading>John Mac Giolla...</Profile.Heading>
                  <Profile.Subheading>
                    May 18, 9:12 AM • 2 <Icon icon="feedback" aria-label="feedback" />
                  </Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.HeaderContent>
            <Card.HeaderActions visibilityMode="hover">
              <IconButton variant="naked" icon="close" aria-label="Reject" />
              <IconButton variant="naked" icon="checkmark" aria-label="Accept" />
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>Modified text with suggested changes</p>
          </Card.Body>

          {threadOpen && (
            <>
              <Card.Divider />
              <div
                style={{ paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                onFocusCapture={() => setActionsVisible(true)}
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <Profile.Root>
                    <Profile.Image src={AVATAR_URL} alt="Sarah Chen" />
                    <Profile.Body>
                      <Profile.Heading>Sarah Chen</Profile.Heading>
                      <Profile.Subheading>May 18, 10:30 AM</Profile.Subheading>
                    </Profile.Body>
                  </Profile.Root>
                  <p style={{ margin: '8px 0 0' }}>This change looks good to me.</p>
                </div>
                <div>
                  <Profile.Root>
                    <Profile.Image src={AVATAR_URL} alt="Mike Torres" />
                    <Profile.Body>
                      <Profile.Heading>Mike Torres</Profile.Heading>
                      <Profile.Subheading>May 18, 11:15 AM</Profile.Subheading>
                    </Profile.Body>
                  </Profile.Root>
                  <p style={{ margin: '8px 0 0' }}>Could we keep the original phrasing instead?</p>
                </div>

                <AutoResizingTextarea
                  value={reply}
                  onChange={setReply}
                  placeholder="Provide feedback..."
                />
                {actionsVisible && (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReply('');
                        setActionsVisible(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReply('');
                        setActionsVisible(false);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card.Root>
      </div>
    );
  }
};
