import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';
import { AutoResizingTextarea } from 'oxide-components/components/autoresizingtextarea/AutoResizingTextarea';
import { Button } from 'oxide-components/components/button/Button';
import * as Card from 'oxide-components/components/card/Card';
import { Icon } from 'oxide-components/components/icon/Icon';
import { IconButton } from 'oxide-components/components/iconbutton/IconButton';
import * as Profile from 'oxide-components/components/profile/Profile';
import { UniverseProvider } from 'oxide-components/Main';
import * as Bem from 'oxide-components/utils/Bem';
import { useState, type FC, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderVisual } from './utils/VisualTestUtils';

interface SuggestedEditsCardOptions {
  readonly index: number;
  readonly active?: boolean;
  readonly resolution?: Card.CardResolution;
}

// eslint-disable-next-line max-len
const AVATAR_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%234A90E2"/%3E%3Ctext x="18" y="24" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif"%3EJM%3C/text%3E%3C/svg%3E';

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  close: allIcons.close,
  checkmark: allIcons.checkmark,
  feedback: allIcons.feedback
};

const mockUniverse = {
  getIcon: (name: string) => Obj.get(icons, name).getOr(`<svg id="${name}"></svg>`),
  translate: Fun.identity
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
            <Card.ExpansionContent ariaLabel="Feedback editor">
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

const groups = [
  { title: 'Real Madrid article', cards: [ 'One', 'Two', 'Three' ] },
  { title: 'Barcelona article', cards: [ 'Four', 'Five', 'Six' ] }
];

// Wide enough to show the heading band and the cards flush against the sides of the group, narrow
// enough for a long title to overflow it.
const renderList = (children: JSX.Element, focusedIndex = -1): JSX.Element => (
  <div style={{ width: '316px' }}>
    <Card.CardList defaultFocusedIndex={focusedIndex} ariaLabel="Suggestions of two documents">
      {children}
    </Card.CardList>
  </div>
);

const renderCard = (label: string, index: number): JSX.Element => (
  <Card.Root key={label} index={index}>
    <Card.Body>
      <p style={{ margin: 0 }}>{`Suggestion ${label}`}</p>
    </Card.Body>
  </Card.Root>
);

const renderGroups = (focusedIndex?: number): JSX.Element => {
  let index = -1;

  return renderList(
    <>
      {groups.map((group) => (
        <Card.CardGroup key={group.title} title={group.title}>
          {group.cards.map((card) => {
            index++;

            return renderCard(card, index);
          })}
        </Card.CardGroup>
      ))}
    </>,
    focusedIndex
  );
};

describe('visual.CardGroupTest', () => {
  it('TINYMCE-14884: renders the cards of two groups under their own titles', async () => {
    const screen = renderVisual(renderGroups());
    await screen.expectScreenshot('card-group');
  });

  it('TINYMCE-14884: renders a focused card inside a group', async () => {
    const screen = renderVisual(renderGroups(3));
    await screen.expectScreenshot('card-group-focused-card');
  });

  it('TINYMCE-14884: renders a long group title truncated', async () => {
    const screen = renderVisual(renderList(
      <Card.CardGroup title="A very long article title that should be truncated with an ellipsis when it does not fit">
        {[ 'One', 'Two' ].map(renderCard)}
      </Card.CardGroup>
    ));
    await screen.expectScreenshot('card-group-title-truncated');
  });
});

const renderSuggestedEditsCard = ({ index, active = false, resolution }: SuggestedEditsCardOptions): ReactElement => (
  <Card.Root
    key={index}
    index={index}
    ariaLabel={`Suggestion ${index + 1}`}
    selected={active}
    hasDecision={resolution !== undefined}
    className={Bem.element('tox-suggestededits', 'card', { active })}
  >
    <div tabIndex={-1} className="tox-suggestededits__card--single">
      <Card.Header>
        <Card.HeaderContent>
          <Profile.Root>
            <Profile.Image src={AVATAR_URL} alt="John Mac Giolla" />
            <Profile.Body>
              <Profile.Heading>John Mac Giolla</Profile.Heading>
              <Profile.Subheading>
                <span className="tox-suggestededits__card--timestamp">
                  May 18, 9:12 AM • 2 <Icon icon="feedback" />
                </span>
              </Profile.Subheading>
            </Profile.Body>
          </Profile.Root>
        </Card.HeaderContent>
        {resolution === undefined ? (
          <Card.HeaderActions visibilityMode={active ? 'always' : 'hover'}>
            <IconButton variant="secondary" icon="close" aria-label="Reject" tabIndex={-1} />
            <IconButton variant="secondary" icon="checkmark" aria-label="Accept" tabIndex={-1} />
          </Card.HeaderActions>
        ) : (
          <Card.HeaderActions visibilityMode="always">
            <Card.ResolutionButton resolution={resolution} label="Revert" tabIndex={-1} />
          </Card.HeaderActions>
        )}
      </Card.Header>
      <Card.Body>
        <div className={Bem.element('tox-suggestededits', 'operations')}>
          <div className={Bem.element('tox-suggestededits', 'operations-details')}>
            <span className={Bem.element('tox-suggestededits', 'operations-text')}>Modified</span>
            <div className={Bem.element('tox-suggestededits', 'operations-content-text')}>
              “Barcelona is football&apos;s most exceptional institution club”
            </div>
          </div>
        </div>
      </Card.Body>
    </div>
    {resolution === undefined && (
      <Card.Expansion open={active}>
        <Card.ExpansionContent ariaLabel="Feedback">
          <Button variant="outlined" className="tox-button--stretch">Provide feedback</Button>
        </Card.ExpansionContent>
      </Card.Expansion>
    )}
  </Card.Root>
);

const renderSuggestedEditsSidebar = (cards: SuggestedEditsCardOptions[]) =>
  renderVisual(
    <UniverseProvider resources={mockUniverse}>
      <div className={Bem.element('tox-suggestededits', 'container')}>
        <div className={Bem.block('tox-suggestededits')}>
          <div className={Bem.element('tox-suggestededits', 'sidebar')}>
            <Card.CardList
              className={Bem.element('tox-suggestededits', 'sidebar-content')}
              defaultFocusedIndex={-1}
              ariaLabel="Review changes"
            >
              {Arr.map(cards, renderSuggestedEditsCard)}
            </Card.CardList>
          </div>
        </div>
      </div>
    </UniverseProvider>
  );

const strictScreenshot = { comparatorOptions: { allowedMismatchedPixelRatio: 0 }};

describe('visual.CardSuggestedEditsTest', () => {
  it('TINYMCE-15187: renders pending cards, inactive and active', async () => {
    const screen = renderSuggestedEditsSidebar([
      { index: 0 },
      { index: 1, active: true }
    ]);
    await screen.expectScreenshot('card-se-pending', strictScreenshot);
  });

  it('TINYMCE-15187: reveals header actions on an inactive pending card on hover', async () => {
    const screen = renderSuggestedEditsSidebar([{ index: 0 }]);
    await userEvent.hover(screen.getByRole('option'));
    await screen.expectScreenshot('card-se-pending-hover', strictScreenshot);
  });

  it('TINYMCE-15187: renders accepted and rejected cards', async () => {
    const screen = renderSuggestedEditsSidebar([
      { index: 0, resolution: 'accept' },
      { index: 1, resolution: 'reject' }
    ]);
    await screen.expectScreenshot('card-se-decided', strictScreenshot);
  });

  it('TINYMCE-15187: swaps the resolution icon for the revert label on hover', async () => {
    const screen = renderSuggestedEditsSidebar([{ index: 0, resolution: 'accept' }]);
    await userEvent.hover(screen.getByRole('button', { name: 'Revert' }));
    await screen.expectScreenshot('card-se-decided-revert-hover', strictScreenshot);
  });

  it('TINYMCE-15187: renders an active decided card', async () => {
    const screen = renderSuggestedEditsSidebar([{ index: 0, active: true, resolution: 'reject' }]);
    await screen.expectScreenshot('card-se-decided-active', strictScreenshot);
  });
});

const renderResolutionCard = (resolution: Card.CardResolution) =>
  renderVisual(
    <UniverseProvider resources={mockUniverse}>
      <div style={{ width: '440px' }}>
        <Card.Root hasDecision={true}>
          <Card.Header>
            <Card.HeaderActions visibilityMode="always">
              <Card.ResolutionButton resolution={resolution} label="Revert" />
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <p style={{ margin: 0 }}>Barcelona is football&apos;s most exceptional institution club.</p>
          </Card.Body>
        </Card.Root>
      </div>
    </UniverseProvider>
  );

const getCardHeight = (container: HTMLElement): number =>
  Optional.from(container.querySelector(Bem.blockSelector('tox-card')))
    .map((card) => card.getBoundingClientRect().height)
    .getOr(0);

describe('visual.CardResolutionButtonTest', () => {
  it('TINYMCE-15187: renders the tick for an accepted card without an avatar', async () => {
    const screen = renderResolutionCard('accept');
    await screen.expectScreenshot('card-resolution-accepted', strictScreenshot);
  });

  it('TINYMCE-15187: renders the cross for a rejected card without an avatar', async () => {
    const screen = renderResolutionCard('reject');
    await screen.expectScreenshot('card-resolution-rejected', strictScreenshot);
  });

  it('TINYMCE-15187: swaps the icon for the label on hover', async () => {
    const screen = renderResolutionCard('accept');
    await userEvent.hover(screen.getByRole('button', { name: 'Revert' }));
    await screen.expectScreenshot('card-resolution-revert-hover', strictScreenshot);
  });

  it('TINYMCE-15187: keeps the card the same height when the label replaces the icon on hover', async () => {
    const screen = renderResolutionCard('accept');
    const idleHeight = getCardHeight(screen.container);
    expect(idleHeight > 0, 'Card should have a measurable height before hover').toBe(true);

    await userEvent.hover(screen.getByRole('button', { name: 'Revert' }));
    await expect.element(screen.getByText('Revert')).toBeVisible();

    expect(getCardHeight(screen.container), 'Card height should not change when the label replaces the icon').toBe(idleHeight);
  });
});
