import { Obj } from '@ephox/katamari';
import { Button } from 'oxide-components/components/button/Button';
import * as Card from 'oxide-components/components/card/Card';
import { IconButton } from 'oxide-components/components/iconbutton/IconButton';
import * as Profile from 'oxide-components/components/profile/Profile';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import type { ReactElement } from 'react';
import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderVisual } from './utils/VisualTestUtils';

// eslint-disable-next-line max-len
const AVATAR_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%234A90E2"/%3E%3Ctext x="18" y="24" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif"%3EJM%3C/text%3E%3C/svg%3E';

const icons: Record<string, string> = {
  close: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z"/></svg>',
  checkmark: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9.55 18L3.85 12.3L5.275 10.875L9.55 15.15L18.725 5.975L20.15 7.4L9.55 18Z"/></svg>'
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
});
