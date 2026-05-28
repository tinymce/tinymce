import { Fun } from '@ephox/katamari';
import * as Menu from 'oxide-components/components/menu/Menu';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import * as Bem from 'oxide-components/utils/Bem';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

const mockUniverse = {
  getIcon: Fun.constant(''),
};

describe('browser.MenuDividerTest', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        {children}
      </div>
    );
  };

  it('Should render with role="separator"', async () => {
    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.Divider />
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { container } = render(<TestComponent />, { wrapper });
    const separator = container.querySelector('[role="separator"]') as HTMLElement;

    expect(separator).toBeDefined();
    expect(separator.getAttribute('role')).toBe('separator');
  });

  it('Should render with correct CSS class', async () => {
    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.Divider />
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { container } = render(<TestComponent />, { wrapper });
    const separator = container.querySelector('[role="separator"]') as HTMLElement;

    expect(separator.className).toBe('tox-collection__item-separator');
  });

  it('Should render between menu items', async () => {
    const TestComponent = () => {
      return (
        <UniverseProvider resources={mockUniverse}>
          <Menu.Root>
            <Menu.Item onAction={Fun.noop}>Item 1</Menu.Item>
            <Menu.Divider />
            <Menu.Item onAction={Fun.noop}>Item 2</Menu.Item>
          </Menu.Root>
        </UniverseProvider>
      );
    };

    const { container } = render(<TestComponent />, { wrapper });
    const separator = container.querySelector('[role="separator"]') as HTMLElement;
    const menuItems = container.querySelectorAll('[role="menuitem"]');

    expect(separator).toBeDefined();
    expect(menuItems.length).toBe(2);
  });
});
