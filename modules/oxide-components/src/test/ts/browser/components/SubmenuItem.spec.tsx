/* eslint-disable max-len */
import type { CommonMenuItemInstanceApi } from 'oxide-components/components/menu/internals/Types';
import * as Menu from 'oxide-components/components/menu/Menu';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import * as Bem from 'oxide-components/utils/Bem';
import { describe, expect, it, vi } from 'vitest';
import { userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

const iconResolver = (icon: string): string => {
  const icons = new Map<string, string>([
    [ 'chevron-right', `<?xml version="1.0" encoding="UTF-8"?>
<svg width="10px" height="10px" viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.2 (57519) - http://www.bohemiancoding.com/sketch -->
    <title>icon-chevron-right</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M2.21845958,1.3349556 C1.91680892,1.0226681 1.92570969,0.536022971 2.23859257,0.234195098 C2.55147544,-0.0676327747 3.05594483,-0.0762190601 3.37967043,0.214773464 L7.76159819,4.44187585 C8.08197558,4.75131828 8.08197558,5.25261554 7.76159819,5.56205798 L3.37967043,9.78916036 C3.05594483,10.0801529 2.55147544,10.0715666 2.23859257,9.76973873 C1.92570969,9.46791085 1.91680892,8.98126573 2.21845958,8.66897823 L6.01978191,5.00196691 L2.21845958,1.3349556 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>` ],
    [ 'checkmark', `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.2 (57519) - http://www.bohemiancoding.com/sketch -->
    <title>icon-checkmark</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M18.1679497,5.4452998 C18.4743022,4.98577112 19.0951715,4.86159725 19.5547002,5.16794971 C20.0142289,5.47430216 20.1384028,6.09517151 19.8320503,6.5547002 L11.8320503,18.5547002 C11.4831227,19.0780915 10.7433669,19.1531818 10.2963845,18.7105809 L5.29919894,13.7623796 C4.90675595,13.3737835 4.90363744,12.7406262 5.29223356,12.3481832 C5.68082968,11.9557402 6.31398698,11.9526217 6.70642997,12.3412178 L10.8411868,16.4354442 L18.1679497,5.4452998 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>` ]
  ]);
  return icons.get(icon) || '';
};

const mockUniverse = {
  getIcon: iconResolver,
};

const waitForElementText = async (getByText: (text: string) => Locator, text: string) => {
  await expect.poll(() => getByText(text).element()).toBeVisible();
};

describe('browser.SubmenuItemTest', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        {children}
      </div>
    );
  };

  it('Should open submenu on hover', async () => {
    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.SubmenuItem
              submenuContent={
                <Menu.Root>
                  <Menu.Item onAction={vi.fn()}>Nested Item</Menu.Item>
                </Menu.Root>
              }
            >
              Submenu
            </Menu.SubmenuItem>
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { getByText } = render(<TestComponent />, { wrapper });
    await waitForElementText(getByText, 'Submenu');

    expect(getByText('Nested Item').query()).toBeNull();

    await userEvent.hover(getByText('Submenu'));
    await waitForElementText(getByText, 'Nested Item');
    expect(getByText('Nested Item').element()).toBeVisible();
  });

  it('Should support nested submenus', async () => {
    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.SubmenuItem
              submenuContent={
                <Menu.Root>
                  <Menu.SubmenuItem
                    submenuContent={
                      <Menu.Root>
                        <Menu.Item onAction={vi.fn()}>Deeply Nested Item</Menu.Item>
                      </Menu.Root>
                    }
                  >
                    Nested Submenu
                  </Menu.SubmenuItem>
                </Menu.Root>
              }
            >
              Open submenu
            </Menu.SubmenuItem>
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { getByText } = render(<TestComponent />, { wrapper });
    await waitForElementText(getByText, 'Open submenu');
    expect(getByText('Open submenu').element()).toBeVisible();

    await userEvent.hover(getByText('Open submenu'));
    await waitForElementText(getByText, 'Nested Submenu');
    expect(getByText('Nested Submenu').element()).toBeVisible();

    await userEvent.hover(getByText('Nested Submenu'));
    await waitForElementText(getByText, 'Deeply Nested Item');

    expect(getByText('Deeply Nested Item').element()).toBeVisible();
  });

  it('Should not open submenu on hover when disabled', async () => {
    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.SubmenuItem
              enabled={false}
              submenuContent={
                <Menu.Root>
                  <Menu.Item onAction={vi.fn()}>Nested Item</Menu.Item>
                </Menu.Root>
              }
            >
              Submenu
            </Menu.SubmenuItem>
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { getByText } = render(<TestComponent />, { wrapper });
    await waitForElementText(getByText, 'Submenu');

    await userEvent.hover(getByText('Submenu'));

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(getByText('Nested Item').query()).toBeNull();
  });

  it('Should not open submenu on click when disabled', async () => {
    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.SubmenuItem
              enabled={false}
              submenuContent={
                <Menu.Root>
                  <Menu.Item onAction={vi.fn()}>Nested Item</Menu.Item>
                </Menu.Root>
              }
            >
              Submenu
            </Menu.SubmenuItem>
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { getByText } = render(<TestComponent />, { wrapper });
    await waitForElementText(getByText, 'Submenu');

    await userEvent.click(getByText('Submenu'));

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(getByText('Nested Item').query()).toBeNull();
  });

  it('Should render with aria-disabled and disabled class when enabled={false}', async () => {
    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.SubmenuItem
              enabled={false}
              submenuContent={
                <Menu.Root>
                  <Menu.Item onAction={vi.fn()}>Nested Item</Menu.Item>
                </Menu.Root>
              }
            >
              Disabled Submenu
            </Menu.SubmenuItem>
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { getByText, container } = render(<TestComponent />, { wrapper });
    await waitForElementText(getByText, 'Disabled Submenu');

    const item = container.querySelector('[role="menuitem"]') as HTMLElement;

    expect(item.getAttribute('aria-disabled')).toBe('true');
    expect(item.className).toContain('tox-collection__item--state-disabled');
  });

  it('Should update enabled state via API', async () => {
    let apiRef: CommonMenuItemInstanceApi | undefined;
    const onSetupSpy = vi.fn((api: CommonMenuItemInstanceApi) => {
      apiRef = api;
      return vi.fn();
    });

    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.SubmenuItem
              onSetup={onSetupSpy}
              submenuContent={
                <Menu.Root>
                  <Menu.Item onAction={vi.fn()}>Nested Item</Menu.Item>
                </Menu.Root>
              }
            >
              Submenu
            </Menu.SubmenuItem>
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { getByText, container } = render(<TestComponent />, { wrapper });
    await waitForElementText(getByText, 'Submenu');

    const item = container.querySelector('[role="menuitem"]') as HTMLElement;

    expect(item.getAttribute('aria-disabled')).toBe('false');
    expect(apiRef).toBeDefined();

    if (apiRef) {
      expect(apiRef.isEnabled()).toBe(true);

      apiRef.setEnabled(false);
      await expect.poll(() => item.getAttribute('aria-disabled')).toBe('true');
      expect(apiRef.isEnabled()).toBe(false);
      expect(item.className).toContain('tox-collection__item--state-disabled');

      apiRef.setEnabled(true);
      await expect.poll(() => item.getAttribute('aria-disabled')).toBe('false');
      expect(apiRef.isEnabled()).toBe(true);
    }
  });

  it('Should not open submenu on hover after being disabled via API', async () => {
    let apiRef: CommonMenuItemInstanceApi | undefined;
    const onSetupSpy = vi.fn((api: CommonMenuItemInstanceApi) => {
      apiRef = api;
      return vi.fn();
    });

    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.SubmenuItem
              onSetup={onSetupSpy}
              submenuContent={
                <Menu.Root>
                  <Menu.Item onAction={vi.fn()}>Nested Item</Menu.Item>
                </Menu.Root>
              }
            >
              Submenu
            </Menu.SubmenuItem>
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { getByText, container } = render(<TestComponent />, { wrapper });
    await waitForElementText(getByText, 'Submenu');

    const item = container.querySelector('[role="menuitem"]') as HTMLElement;

    expect(apiRef).toBeDefined();
    if (apiRef) {
      apiRef.setEnabled(false);
      await expect.poll(() => item.getAttribute('aria-disabled')).toBe('true');

      await userEvent.hover(getByText('Submenu'));
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(getByText('Nested Item').query()).toBeNull();
    }
  });

  it('Should keep submenu open while item is active and close when moving to sibling', async () => {
    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.SubmenuItem
              submenuContent={
                <Menu.Root>
                  <Menu.Item onAction={vi.fn()}>Nested Item</Menu.Item>
                </Menu.Root>
              }
            >
              Submenu
            </Menu.SubmenuItem>
            <Menu.Item onAction={vi.fn()}>Sibling Item</Menu.Item>
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { getByText } = render(<TestComponent />, { wrapper });
    await waitForElementText(getByText, 'Submenu');

    await userEvent.hover(getByText('Submenu'));
    await waitForElementText(getByText, 'Nested Item');
    expect(getByText('Nested Item').element()).toBeVisible();

    await userEvent.hover(document.body);

    // Poll to ensure submenu remains visible after debounce timers
    await expect.poll(() => getByText('Nested Item').element(), { timeout: 450 }).toBeVisible();

    await userEvent.hover(getByText('Sibling Item'));
    await expect.poll(() => getByText('Nested Item').query()).toBeNull();
  });
});
