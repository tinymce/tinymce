/* eslint-disable max-len */
import { userEvent, type Locator } from '@vitest/browser/context';
import type { ToggleMenuItemInstanceApi } from 'oxide-components/components/menu/internals/Types';
import * as Menu from 'oxide-components/components/menu/Menu';
import * as MenuRenderer from 'oxide-components/components/menu/MenuRenderer';
import * as Bem from 'oxide-components/utils/Bem';
import { describe, expect, it } from 'vitest';
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

const waitForElementText = async (getByText: (text: string) => Locator, text: string) => {
  await expect.poll(() => getByText(text).element()).toBeVisible();
};

// Reset positioning styles before matching the snapshot.
// Postioning styles are calculated to a different value depending on the enviroment.
// They are deterministic for one eviroment but differ between local machine and CI
const resetPostioningStyles = (fragment: DocumentFragment): DocumentFragment => {
  fragment.querySelectorAll('.tox-dropdown-content').forEach((dropdownContent) => {
    (dropdownContent as HTMLElement).style.maxWidth = '';
    (dropdownContent as HTMLElement).style.top = '';
    (dropdownContent as HTMLElement).style.left = '';
  });
  return fragment;
};

describe('browser.MenuTest', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        {children}
      </div>
    );
  };

  it('Should be able to open submenus', async () => {
    const TestComponent = () => {
      return (
        <Menu.Root>
          <Menu.Item
            iconResolver={iconResolver}
            autoFocus={true}
            // eslint-disable-next-line no-console
            onAction= {() => console.log('Clicked Menu item 1')}
          >{'Menu item 1'}</Menu.Item>
          <Menu.ToggleItem
            iconResolver={iconResolver}
            onAction= {(api: ToggleMenuItemInstanceApi): void => {
              api.setActive(!api.isActive());
              // eslint-disable-next-line no-console
              console.log('You toggled a menuitem');
            }}
          >{'Menu item 2'}</Menu.ToggleItem>
          <Menu.SubmenuItem
            iconResolver={iconResolver}
            icon={'item'}
            submenuContent={<Menu.Root>
              <Menu.Item
                autoFocus={true}
                iconResolver={iconResolver}
                // eslint-disable-next-line no-console
                onAction= {() => console.log('Clicked nested menu item 1')}
              >
                {'Nested menu item 1'}
              </Menu.Item>
              <Menu.ToggleItem
                enabled={false}
                iconResolver={iconResolver}
                onAction= {(api: ToggleMenuItemInstanceApi): void => {
                  api.setActive(!api.isActive());
                  // eslint-disable-next-line no-console
                  console.log('You toggled a nested menu item 2');
                }}
              >
                {'Nested menu item 2'}
              </Menu.ToggleItem>
            </Menu.Root>}
          >
            {'Submenu'}
          </Menu.SubmenuItem>
        </Menu.Root>
      );
    };

    const { asFragment, getByText } = render(<TestComponent />, { wrapper });

    await waitForElementText(getByText, 'Menu item 1');
    expect(asFragment()).toMatchSnapshot('1. Before open submenu');

    await userEvent.hover(getByText('Submenu'));
    await waitForElementText(getByText, 'Nested menu item 1');
    const fragment = resetPostioningStyles(asFragment());
    expect(fragment).toMatchSnapshot('2. After opening submenu');
  });

  it('Should be able to render using MenuRenderer', async () => {
    const TestComponent = () => {
      return MenuRenderer.render({ iconResolver, items: [
        {
          type: 'menuitem',
          text: 'Menu item 1',
          // eslint-disable-next-line no-console
          onAction: () => console.log('Clicked Menu item 1')
        },
        {
          type: 'togglemenuitem',
          text: 'Menu item 2',
          onAction: (api: ToggleMenuItemInstanceApi): void => {
            api.setActive(!api.isActive());
            // eslint-disable-next-line no-console
            console.log('You toggled a menuitem');
          }
        },
        {
          type: 'submenu',
          text: 'Submenu',
          items: [
            {
              type: 'menuitem',
              text: 'Nested menu item 1',
              // eslint-disable-next-line no-console
              onAction: () => console.log('Clicked nested menu item 1')
            },
            {
              type: 'togglemenuitem',
              text: 'Nested menu item 2',
              onAction: (api: ToggleMenuItemInstanceApi): void => {
                api.setActive(!api.isActive());
                // eslint-disable-next-line no-console
                console.log('You toggled a nested menu item 2');
              }
            },
          ]
        }
      ] });
    };

    const { asFragment, getByText } = render(<TestComponent />, { wrapper });

    await waitForElementText(getByText, 'Menu item 1');
    expect(asFragment()).toMatchSnapshot('1. Before open submenu');

    await userEvent.hover(getByText('Submenu'));
    await waitForElementText(getByText, 'Nested menu item 1');
    const fragment = resetPostioningStyles(asFragment());
    expect(fragment).toMatchSnapshot('2. After opening submenu');
  });
});
