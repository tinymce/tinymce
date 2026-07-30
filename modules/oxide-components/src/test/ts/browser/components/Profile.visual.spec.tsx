import * as Profile from 'oxide-components/components/profile/Profile';
import { describe, it } from 'vitest';

import { renderVisual } from './utils/VisualTestUtils';

// eslint-disable-next-line max-len
const AVATAR_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%234A90E2"/%3E%3Ctext x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="sans-serif"%3EJD%3C/text%3E%3C/svg%3E';

describe('visual.ProfileTest', () => {
  it('renders profile with avatar', async () => {
    const screen = renderVisual(
      <Profile.Root>
        <Profile.Image src={AVATAR_URL} alt="John Doe" />
        <Profile.Body>
          <Profile.Heading>John Doe</Profile.Heading>
        </Profile.Body>
      </Profile.Root>
    );
    await screen.expectScreenshot('profile-with-avatar');
  });

  it('renders profile without avatar', async () => {
    const screen = renderVisual(
      <Profile.Root>
        <Profile.Body>
          <Profile.Heading>System</Profile.Heading>
        </Profile.Body>
      </Profile.Root>
    );
    await screen.expectScreenshot('profile-without-avatar');
  });

  it('renders profile with timestamp', async () => {
    const screen = renderVisual(
      <Profile.Root>
        <Profile.Image src={AVATAR_URL} alt="John Doe" />
        <Profile.Body>
          <Profile.Heading>John Doe</Profile.Heading>
          <Profile.Subheading>2 hours ago</Profile.Subheading>
        </Profile.Body>
      </Profile.Root>
    );
    await screen.expectScreenshot('profile-with-timestamp');
  });

  it('renders profile with long name', async () => {
    const screen = renderVisual(
      <div style={{ width: '316px' }}>
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="John Mac Giolla Phádraig" />
          <Profile.Body>
            <Profile.Heading>John Mac Giolla Phádraig</Profile.Heading>
            <Profile.Subheading>May 18, 9:12 AM</Profile.Subheading>
          </Profile.Body>
        </Profile.Root>
      </div>
    );
    await screen.expectScreenshot('profile-with-long-name');
  });
});
