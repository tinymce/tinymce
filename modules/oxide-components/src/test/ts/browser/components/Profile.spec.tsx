import * as Profile from 'oxide-components/components/profile/Profile';
import { UniverseProvider } from 'oxide-components/main';
import * as Bem from 'oxide-components/utils/Bem';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

describe('browser.components.ProfileTest', () => {
  const getIcon = vi.fn((icon: string) => `<svg id="${icon}"></svg>`);
  const mockUniverse = {
    getIcon,
  };

  const wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        <UniverseProvider resources={mockUniverse}>
          {children}
        </UniverseProvider>
      </div>
    );
  };

  const AVATAR_URL = 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E';

  describe('Rendering Tests', () => {
    it('Should render Profile.Root with default props', async () => {
      const { container } = render(
        <Profile.Root>
          <Profile.Body>
            <Profile.Heading>Test User</Profile.Heading>
          </Profile.Body>
        </Profile.Root>,
        { wrapper }
      );

      const profile = container.querySelector('.tox-profile');
      expect(profile).toBeTruthy();
    });

    it('Should render Profile with all parts (Image, Body, Heading, Subheading)', async () => {
      const { getByText, container } = render(
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="John Doe" />
          <Profile.Body>
            <Profile.Heading>John Doe</Profile.Heading>
            <Profile.Subheading>2 hours ago</Profile.Subheading>
          </Profile.Body>
        </Profile.Root>,
        { wrapper }
      );

      expect(getByText('John Doe').element()).toBeTruthy();
      expect(getByText('2 hours ago').element()).toBeTruthy();
      expect(container.querySelector('.tox-profile__image')).toBeTruthy();
      expect(container.querySelector('.tox-profile__body')).toBeTruthy();
      expect(container.querySelector('.tox-profile__heading')).toBeTruthy();
      expect(container.querySelector('.tox-profile__subheading')).toBeTruthy();
    });

    it('Should render Profile.Image with correct attributes', async () => {
      const { container } = render(
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="John Doe" />
        </Profile.Root>,
        { wrapper }
      );

      const img = container.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.getAttribute('src')).toBe(AVATAR_URL);
      expect(img?.getAttribute('alt')).toBe('John Doe');
    });

    it('Should render Profile without Image', async () => {
      const { getByText, container } = render(
        <Profile.Root>
          <Profile.Body>
            <Profile.Heading>System</Profile.Heading>
          </Profile.Body>
        </Profile.Root>,
        { wrapper }
      );

      expect(getByText('System').element()).toBeTruthy();
      expect(container.querySelector('.tox-profile__image')).toBeFalsy();
    });

    it('Should apply custom className to Profile.Root', async () => {
      const { container } = render(
        <Profile.Root className="custom-profile">
          <Profile.Body>
            <Profile.Heading>Test</Profile.Heading>
          </Profile.Body>
        </Profile.Root>,
        { wrapper }
      );

      const profile = container.querySelector('.tox-profile');
      expect(profile?.className).toContain('custom-profile');
    });
  });

  describe('Structure Tests', () => {
    it('Should render avatar within correct structure', async () => {
      const { container } = render(
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="Test User" />
        </Profile.Root>,
        { wrapper }
      );

      const imageWrapper = container.querySelector('.tox-profile__image');
      const avatar = container.querySelector('.tox-user-avatar');
      const img = container.querySelector('img');

      expect(imageWrapper).toBeTruthy();
      expect(avatar).toBeTruthy();
      expect(img?.parentElement).toBe(avatar);
      expect(avatar?.parentElement).toBe(imageWrapper);
    });

    it('Should allow custom content in Heading', async () => {
      const { getByText } = render(
        <Profile.Root>
          <Profile.Body>
            <Profile.Heading>
              Test User <span>Badge</span>
            </Profile.Heading>
          </Profile.Body>
        </Profile.Root>,
        { wrapper }
      );

      expect(getByText('Test User').element()).toBeTruthy();
      expect(getByText('Badge').element()).toBeTruthy();
    });

    it('Should allow custom content in Subheading', async () => {
      const { getByText } = render(
        <Profile.Root>
          <Profile.Body>
            <Profile.Subheading>
              <span>Custom</span> content
            </Profile.Subheading>
          </Profile.Body>
        </Profile.Root>,
        { wrapper }
      );

      expect(getByText('Custom').element()).toBeTruthy();
      expect(getByText('content').element()).toBeTruthy();
    });
  });

  describe('Composition Tests', () => {
    it('Should compose Profile with only Heading', async () => {
      const { getByText, container } = render(
        <Profile.Root>
          <Profile.Body>
            <Profile.Heading>Only Heading</Profile.Heading>
          </Profile.Body>
        </Profile.Root>,
        { wrapper }
      );

      expect(getByText('Only Heading').element()).toBeTruthy();
      expect(container.querySelector('.tox-profile__subheading')).toBeFalsy();
    });

    it('Should compose Profile with Heading and Subheading', async () => {
      const { getByText } = render(
        <Profile.Root>
          <Profile.Body>
            <Profile.Heading>Main Text</Profile.Heading>
            <Profile.Subheading>Secondary Text</Profile.Subheading>
          </Profile.Body>
        </Profile.Root>,
        { wrapper }
      );

      expect(getByText('Main Text').element()).toBeTruthy();
      expect(getByText('Secondary Text').element()).toBeTruthy();
    });

    it('Should compose Profile with Image and Body', async () => {
      const { getByText, container } = render(
        <Profile.Root>
          <Profile.Image src={AVATAR_URL} alt="User" />
          <Profile.Body>
            <Profile.Heading>User Name</Profile.Heading>
          </Profile.Body>
        </Profile.Root>,
        { wrapper }
      );

      expect(container.querySelector('.tox-profile__image')).toBeTruthy();
      expect(getByText('User Name').element()).toBeTruthy();
    });

    it('Should allow arbitrary children order', async () => {
      const { getByText, container } = render(
        <Profile.Root>
          <Profile.Body>
            <Profile.Heading>Name</Profile.Heading>
            <Profile.Subheading>Time</Profile.Subheading>
          </Profile.Body>
          <Profile.Image src={AVATAR_URL} alt="User" />
        </Profile.Root>,
        { wrapper }
      );

      expect(getByText('Name').element()).toBeTruthy();
      expect(getByText('Time').element()).toBeTruthy();
      expect(container.querySelector('.tox-profile__image')).toBeTruthy();
    });
  });
});
