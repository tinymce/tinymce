import { Arr, Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';

import { Button, UniverseProvider } from '../../main';
import * as Card from '../card/Card';
import { Icon } from '../icon/Icon';

import * as Profile from './Profile';

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  checkmark: allIcons.checkmark,
  close: allIcons.close,
  feedback: allIcons.feedback
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOr(`<svg id="${name}"></svg>`)
};

// eslint-disable-next-line max-len
const AVATAR_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%234A90E2"/%3E%3Ctext x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="sans-serif"%3EJD%3C/text%3E%3C/svg%3E';

const meta = {
  title: 'components/Profile',
  component: Profile.Root,
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
The Profile component is a reusable compound component for displaying user information consistently across plugins.

## Features
- **Compound Component Pattern**: Flexible composition with Root, Image, Body, Heading, and Subheading
- **Flexible Layouts**: Supports avatar, name, timestamp, and metadata
- **Works with Card**: Designed to integrate seamlessly with the Card component

## Usage Pattern

The component uses a compound component pattern with five parts:
- \`Profile.Root\`: Container for the profile
- \`Profile.Image\`: Avatar/profile image
- \`Profile.Body\`: Container for text content
- \`Profile.Heading\`: Main text (usually name)
- \`Profile.Subheading\`: Secondary text (usually timestamp or metadata)

## Integration

Works seamlessly with oxide-components:
- **Card**: For displaying user info in cards
- **Button**: For action buttons
- **Icon**: For badges and indicators
        `
      }
    }
  },
  tags: [ 'autodocs' ],
  args: {},
} satisfies Meta<typeof Profile.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAvatar: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Profile with Avatar**

A complete profile display with avatar image, name, and no additional metadata.
This demonstrates the basic usage pattern with all visual elements.

Common use case: Displaying the author of a suggested edit or comment.
        `
      }
    }
  },
  render: () => {
    return (
      <div style={{ width: '316px', padding: '12px', backgroundColor: '#f9f9f9' }}>
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="John Doe" />
          <Profile.Body>
            <Profile.Heading>John Doe</Profile.Heading>
          </Profile.Body>
        </Profile.Root>
      </div>
    );
  }
};

export const WithoutAvatar: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Profile without Avatar**

A minimal profile display showing only the name without an avatar image.
Useful when user images are not available or not needed.

Common use case: System-generated suggestions or when avatars are disabled.
        `
      }
    }
  },
  render: () => {
    return (
      <div style={{ width: '316px', padding: '12px', backgroundColor: '#f9f9f9' }}>
        <Profile.Root>
          <Profile.Body>
            <Profile.Heading>System</Profile.Heading>
          </Profile.Body>
        </Profile.Root>
      </div>
    );
  }
};

export const WithTimestamp: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Profile with Timestamp**

Profile with avatar, name, and timestamp subheading.
This is the most common pattern for feedback and comment systems.

Common use case: Displaying when a user made a suggestion or left feedback.
        `
      }
    }
  },
  render: () => {
    return (
      <div style={{ width: '316px', padding: '12px', backgroundColor: '#f9f9f9' }}>
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="John Doe" />
          <Profile.Body>
            <Profile.Heading>John Doe</Profile.Heading>
            <Profile.Subheading>2 hours ago</Profile.Subheading>
          </Profile.Body>
        </Profile.Root>
      </div>
    );
  }
};

export const InCardHeader: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Profile in Card Header**

Demonstrates how Profile integrates with the Card component header.
This shows a typical Suggested Edits card pattern with user attribution.

Common use case: Review cards, suggestion cards, and activity feeds.
        `
      }
    }
  },
  render: () => {
    return (
      <div style={{ width: '316px' }}>
        <Card.Root>
          <Card.Header>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Doe" />
              <Profile.Body>
                <Profile.Heading>John Doe</Profile.Heading>
              </Profile.Body>
            </Profile.Root>
          </Card.Header>
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
      </div>
    );
  }
};

export const InCardWithTimestamp: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Profile with Timestamp in Card**

Shows Profile with timestamp metadata integrated into a Card.
This is the pattern used in feedback systems where both author and time are important.

Common use case: Comment cards, review feedback, revision history.
        `
      }
    }
  },
  render: () => {
    return (
      <div style={{ width: '316px' }}>
        <Card.Root>
          <Card.Header>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="Jane Smith" />
              <Profile.Body>
                <Profile.Heading>Jane Smith</Profile.Heading>
                <Profile.Subheading>Yesterday at 3:45 PM</Profile.Subheading>
              </Profile.Body>
            </Profile.Root>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>
              This suggestion looks good, but we should verify the facts about the 2008-2012 era.
            </p>
          </Card.Body>
          <Card.Actions>
            <Button variant="outlined">Edit</Button>
            <Button variant="outlined">Delete</Button>
          </Card.Actions>
        </Card.Root>
      </div>
    );
  }
};

export const MultipleProfilesInCards: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Multiple Profiles in Cards**

Demonstrates consistency across multiple cards with different users.
Shows how Profile maintains visual consistency in a list of items.

Common use case: Activity feed, comment thread, suggestion list.
        `
      }
    }
  },
  render: () => {
    const users = [
      { name: 'John Doe', time: '2 hours ago', avatar: AVATAR_URL },
      { name: 'Jane Smith', time: 'Yesterday', avatar: AVATAR_URL.replace('JD', 'JS').replace('4A90E2', 'E24A90') },
      { name: 'Bob Wilson', time: 'Last week', avatar: AVATAR_URL.replace('JD', 'BW').replace('4A90E2', '90E24A') }
    ];

    return (
      <div style={{ width: '316px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Arr.map(users, (user, index) => (
          <Card.Root key={index}>
            <Card.Header>
              <Profile.Root>
                <Profile.Image src={user.avatar} alt={user.name} />
                <Profile.Body>
                  <Profile.Heading>{user.name}</Profile.Heading>
                  <Profile.Subheading>{user.time}</Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.Header>
            <Card.Body>
              <p style={{ margin: 0 }}>
                Review comment from {user.name}
              </p>
            </Card.Body>
          </Card.Root>
        ))}
      </div>
    );
  }
};

export const WithCustomContent: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Profile with Custom Content**

Shows flexibility of the compound component pattern.
You can add custom elements like badges, icons, or status indicators.

Common use case: AI attribution badges, verified user indicators, role labels.
        `
      }
    }
  },
  render: () => {
    return (
      <div style={{ width: '316px', padding: '12px', backgroundColor: '#f9f9f9' }}>
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="AI Assistant" />
          <Profile.Body>
            <Profile.Heading>
              AI Assistant
              <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>🤖</span>
            </Profile.Heading>
            <Profile.Subheading>Generated just now</Profile.Subheading>
          </Profile.Body>
        </Profile.Root>
      </div>
    );
  }
};

export const WithMetadataAndCount: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Profile with Metadata and Count**

Profile with avatar, name, timestamp, and a count indicator.
Useful for displaying user activity with associated metrics (comments, reactions, etc.).

Common use case: Activity feeds, comment threads, revision history.
        `
      }
    }
  },
  render: () => {
    const count = 2;
    const timestamp = 'May 18, 9:12 AM';

    return (
      <div style={{ width: '316px' }}>
        <Card.Root>
          <Card.Header>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Mac Giolla Phádraig" />
              <Profile.Body>
                <Profile.Heading>John Mac Giolla Phádraig</Profile.Heading>
                <Profile.Subheading>
                  {timestamp} • {count} <Icon icon="feedback" aria-label="comments" />
                </Profile.Subheading>
              </Profile.Body>
            </Profile.Root>
          </Card.Header>
          <Card.Body>
            <div>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Deleted text</p>
              <p style={{ margin: 0 }}>In many ways</p>
            </div>
          </Card.Body>
        </Card.Root>
      </div>
    );
  }
};

export const MultipleWithCounts: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Multiple Profiles with Counts**

Multiple cards showing different count states:
- Profile in header with user info
- Timestamp with optional count indicator
- Shows count and icon when present
- Shows only timestamp when count is zero

Demonstrates consistent layout across multiple items.
        `
      }
    }
  },
  render: () => {
    const cards = [
      {
        user: 'John Mac Giolla Phádraig',
        avatar: AVATAR_URL,
        timestamp: 'May 18, 9:12 AM',
        count: 2,
        title: 'Deleted text',
        content: 'In many ways'
      },
      {
        user: 'Jane Smith',
        avatar: AVATAR_URL.replace('JD', 'JS').replace('4A90E2', 'E24A90'),
        timestamp: 'May 18, 10:30 AM',
        count: 5,
        title: 'Modified paragraph',
        content: 'Changed wording for clarity'
      },
      {
        user: 'Bob Wilson',
        avatar: AVATAR_URL.replace('JD', 'BW').replace('4A90E2', '90E24A'),
        timestamp: 'May 18, 2:45 PM',
        count: 0,
        title: 'Added heading',
        content: 'New section header'
      }
    ];

    return (
      <div style={{ width: '316px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Arr.map(cards, (card, index) => (
          <Card.Root key={index}>
            <Card.Header>
              <Profile.Root>
                <Profile.Image src={card.avatar} alt={card.user} />
                <Profile.Body>
                  <Profile.Heading>{card.user}</Profile.Heading>
                  <Profile.Subheading>
                    {card.count > 0
                      ? `${card.timestamp} • ${card.count} `
                      : card.timestamp
                    }
                    {card.count > 0 && <Icon icon="feedback" aria-label="comments" />}
                  </Profile.Subheading>
                </Profile.Body>
              </Profile.Root>
            </Card.Header>
            <Card.Body>
              <div>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{card.title}</p>
                <p style={{ margin: 0 }}>{card.content}</p>
              </div>
            </Card.Body>
          </Card.Root>
        ))}
      </div>
    );
  }
};
