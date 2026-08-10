import { Fun, Obj } from '@ephox/katamari';
import { AutoResizingTextarea } from 'oxide-components/components/autoresizingtextarea/AutoResizingTextarea';
import { Button } from 'oxide-components/components/button/Button';
import * as Card from 'oxide-components/components/card/Card';
import { Icon } from 'oxide-components/components/icon/Icon';
import { IconButton } from 'oxide-components/components/iconbutton/IconButton';
import * as Profile from 'oxide-components/components/profile/Profile';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import { useState, type FC, type ReactElement } from 'react';
import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderVisual } from './utils/VisualTestUtils';

// eslint-disable-next-line max-len
const AVATAR_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%234A90E2"/%3E%3Ctext x="18" y="24" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif"%3EJM%3C/text%3E%3C/svg%3E';

const icons: Record<string, string> = {
  close: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z"/></svg>',
  checkmark: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9.55 18L3.85 12.3L5.275 10.875L9.55 15.15L18.725 5.975L20.15 7.4L9.55 18Z"/></svg>',
  feedback: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>'
};

const mockUniverse = {
  getIcon: (name: string) => Obj.get(icons, name).getOr(`<svg id="${name}"></svg>`)
};

const renderCardVisual = (ui: ReactElement) =>
  renderVisual(
    <UniverseProvider resources={mockUniverse}>
      <div style={{ width: '316px' }}>
        {ui}
      </div>
    </UniverseProvider>
  );

describe('visual.CardTest', () => {
  it('TINY-14722: renders legacy header title', async () => {
    const screen = renderCardVisual(
      <Card.Root selected={true}>
        <Card.Header title="Review Suggestion" />
        <Card.Body>
          <p style={{ margin: 0 }}>Legacy header layout</p>
        </Card.Body>
        <Card.Actions>
          <Button variant="outlined">Skip</Button>
          <Button variant="outlined">Apply</Button>
        </Card.Actions>
      </Card.Root>
    );
    await screen.expectScreenshot('card-legacy-header');
  });

  it('TINY-14722: renders header actions always visible with Profile', async () => {
    const screen = renderCardVisual(
      <Card.Root selected={true}>
        <Card.Header>
          <Card.HeaderContent>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Mac Giolla" />
              <Profile.Body>
                <Profile.Heading>John Mac Giolla...</Profile.Heading>
                <Profile.Subheading>May 18, 9:12 AM</Profile.Subheading>
              </Profile.Body>
            </Profile.Root>
          </Card.HeaderContent>
          <Card.HeaderActions visibilityMode="always">
            <IconButton variant="naked" icon="close" aria-label="Reject" />
            <IconButton variant="naked" icon="checkmark" aria-label="Accept" />
          </Card.HeaderActions>
        </Card.Header>
        <Card.Body>
          <p style={{ margin: 0 }}>Modified text</p>
        </Card.Body>
        <Card.Actions>
          <Button variant="outlined" className="tox-button--stretch">Provide feedback</Button>
        </Card.Actions>
      </Card.Root>
    );
    await screen.expectScreenshot('card-header-actions-always');
  });

  it('TINY-14722: renders header actions hidden by default in hover mode', async () => {
    const screen = renderCardVisual(
      <Card.Root selected={true}>
        <Card.Header>
          <Card.HeaderContent>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Mac Giolla" />
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
        <Card.Actions>
          <Button variant="outlined" className="tox-button--stretch">Provide feedback</Button>
        </Card.Actions>
      </Card.Root>
    );
    await screen.expectScreenshot('card-header-actions-hover-hidden');
  });

  it('TINY-14722: reveals header actions on hover', async () => {
    const screen = renderCardVisual(
      <Card.Root selected={true}>
        <Card.Header>
          <Card.HeaderContent>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Mac Giolla" />
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
        <Card.Actions>
          <Button variant="outlined" className="tox-button--stretch">Provide feedback</Button>
        </Card.Actions>
      </Card.Root>
    );

    await userEvent.hover(screen.getByRole('option'));
    await screen.expectScreenshot('card-header-actions-hover-revealed');
  });

  it('TINYMCE-14723: renders expansion collapsed by default', async () => {
    const screen = renderCardVisual(
      <Card.Root selected={true}>
        <Card.Header>
          <Card.HeaderContent>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Mac Giolla" />
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
        <Card.Expansion open={false} onOpenChange={Fun.noop}>
          <Card.ExpansionTrigger>
            <Button variant="outlined" className="tox-button--stretch">
              Provide feedback
            </Button>
          </Card.ExpansionTrigger>
          <Card.ExpansionContent>
            <AutoResizingTextarea
              value=""
              onChange={Fun.noop}
              placeholder="Provide feedback..."
            />
          </Card.ExpansionContent>
        </Card.Expansion>
      </Card.Root>
    );
    await screen.expectScreenshot('card-expansion-collapsed');
  });

  it('TINYMCE-14723: renders expansion expanded with textarea', async () => {
    const screen = renderCardVisual(
      <Card.Root selected={true}>
        <Card.Header>
          <Card.HeaderContent>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Mac Giolla" />
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
        <Card.Expansion open={true} onOpenChange={Fun.noop}>
          <Card.ExpansionTrigger>
            <Button variant="outlined" className="tox-button--stretch">
              Provide feedback
            </Button>
          </Card.ExpansionTrigger>
          <Card.ExpansionContent>
            <AutoResizingTextarea
              value=""
              onChange={Fun.noop}
              placeholder="Provide feedback..."
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="outlined">Cancel</Button>
              <Button variant="primary">Save</Button>
            </div>
          </Card.ExpansionContent>
        </Card.Expansion>
      </Card.Root>
    );
    await screen.expectScreenshot('card-expansion-expanded');
  });

  it('TINYMCE-14723: renders expansion with trigger hidden when open', async () => {
    const FeedbackComposer: FC = () => {
      const [ open ] = useState(true);
      const [ feedback ] = useState('');

      return (
        <Card.Root selected={true}>
          <Card.Header>
            <Card.HeaderContent>
              <Profile.Root>
                <Profile.Image src={AVATAR_URL} alt="John Mac Giolla" />
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
          <Card.Expansion open={open} onOpenChange={Fun.noop}>
            {!open && (
              <Card.ExpansionTrigger>
                <Button variant="outlined" className="tox-button--stretch">
                  Provide feedback
                </Button>
              </Card.ExpansionTrigger>
            )}
            <Card.ExpansionContent>
              <AutoResizingTextarea
                value={feedback}
                onChange={Fun.noop}
                placeholder="Provide feedback..."
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button variant="outlined">Cancel</Button>
                <Button variant="primary">Save</Button>
              </div>
            </Card.ExpansionContent>
          </Card.Expansion>
        </Card.Root>
      );
    };

    const screen = renderCardVisual(<FeedbackComposer />);
    await screen.expectScreenshot('card-expansion-trigger-hidden');
  });

  it('TINYMCE-14723: renders nested expansion for comment replies collapsed', async () => {
    const screen = renderCardVisual(
      <Card.Root selected={true}>
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
          <p style={{ margin: 0 }}>Can we clarify this section before publishing?</p>
        </Card.Body>
        <Card.Expansion open={false} onOpenChange={Fun.noop}>
          <Card.ExpansionTrigger>
            <Button variant="outlined" className="tox-button--stretch">
              2 replies
            </Button>
          </Card.ExpansionTrigger>
          <Card.ExpansionContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              <Card.Expansion open={false} onOpenChange={Fun.noop}>
                <Card.ExpansionTrigger>
                  <Button variant="outlined" className="tox-button--stretch">
                    Add comment...
                  </Button>
                </Card.ExpansionTrigger>
                <Card.ExpansionContent>
                  <AutoResizingTextarea
                    value=""
                    onChange={Fun.noop}
                    placeholder="Add comment..."
                  />
                </Card.ExpansionContent>
              </Card.Expansion>
            </div>
          </Card.ExpansionContent>
        </Card.Expansion>
      </Card.Root>
    );
    await screen.expectScreenshot('card-expansion-nested-collapsed');
  });

  it('TINYMCE-14723: renders nested expansion for comment replies expanded', async () => {
    const screen = renderCardVisual(
      <Card.Root selected={true}>
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
          <p style={{ margin: 0 }}>Can we clarify this section before publishing?</p>
        </Card.Body>
        <Card.Expansion open={true} onOpenChange={Fun.noop}>
          <Card.ExpansionTrigger>
            <Button variant="outlined" className="tox-button--stretch">
              2 replies
            </Button>
          </Card.ExpansionTrigger>
          <Card.ExpansionContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              <Card.Expansion open={true} onOpenChange={Fun.noop}>
                <Card.ExpansionTrigger>
                  <Button variant="outlined" className="tox-button--stretch">
                    Add comment...
                  </Button>
                </Card.ExpansionTrigger>
                <Card.ExpansionContent>
                  <AutoResizingTextarea
                    value=""
                    onChange={Fun.noop}
                    placeholder="Add comment..."
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button variant="outlined">Cancel</Button>
                    <Button variant="primary">Comment</Button>
                  </div>
                </Card.ExpansionContent>
              </Card.Expansion>
            </div>
          </Card.ExpansionContent>
        </Card.Expansion>
      </Card.Root>
    );
    await screen.expectScreenshot('card-expansion-nested-expanded');
  });

  it('TINYMCE-14723: renders feedback thread with nested replies', async () => {
    const screen = renderCardVisual(
      <Card.Root selected={true}>
        <Card.Header>
          <Card.HeaderContent>
            <Profile.Root>
              <Profile.Image src={AVATAR_URL} alt="John Mac Giolla" />
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
        <Card.Expansion open={true} onOpenChange={Fun.noop}>
          <Card.ExpansionTrigger>
            <Button variant="outlined" className="tox-button--stretch">
              View feedback (2)
            </Button>
          </Card.ExpansionTrigger>
          <Card.ExpansionContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              <Card.Expansion open={false} onOpenChange={Fun.noop}>
                <Card.ExpansionTrigger>
                  <Button variant="outlined" className="tox-button--stretch">
                    Provide feedback
                  </Button>
                </Card.ExpansionTrigger>
                <Card.ExpansionContent>
                  <AutoResizingTextarea
                    value=""
                    onChange={Fun.noop}
                    placeholder="Provide feedback..."
                  />
                </Card.ExpansionContent>
              </Card.Expansion>
            </div>
          </Card.ExpansionContent>
        </Card.Expansion>
      </Card.Root>
    );
    await screen.expectScreenshot('card-expansion-feedback-thread');
  });
});
