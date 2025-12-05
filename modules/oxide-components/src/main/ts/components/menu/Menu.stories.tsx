/* eslint-disable max-len */
import { Fun, Id } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dropdown, Icon, IconButton } from 'oxide-components/main';

import type { ToggleMenuItemInstanceApi } from './internals/Types';
import * as Menu from './Menu';

const meta = {
  title: 'components/Menu',
  component: Menu.Root,
  argTypes: {},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: ``
      }
    }
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof Menu.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

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
</svg>` ],
    [ 'item', `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51.3 (57544) - http://www.bohemiancoding.com/sketch -->
    <title>icon-emoji</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M9,11 C9.55,11 10,10.55 10,10 C10,9.45 9.55,9 9,9 C8.45,9 8,9.45 8,10 C8,10.55 8.45,11 9,11 Z M15,11 C15.55,11 16,10.55 16,10 C16,9.45 15.55,9 15,9 C14.45,9 14,9.45 14,10 C14,10.55 14.45,11 15,11 Z M12,16.5 C14.14,16.5 15.92,15 16.38,13 L7.62,13 C8.08,15 9.86,16.5 12,16.5 Z M12,4 C7.57,4 4,7.58 4,12 C4,16.42 7.57,20 12,20 C16.43,20 20,16.42 20,12 C20,7.58 16.42,4 12,4 Z M12,18.5 C8.41,18.5 5.5,15.59 5.5,12 C5.5,8.41 8.41,5.5 12,5.5 C15.59,5.5 18.5,8.41 18.5,12 C18.5,15.59 15.59,18.5 12,18.5 Z" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>` ]
  ]);
  return icons.get(icon) || '';
};

const menu: JSX.Element = (
  <Menu.Root>
    <Menu.Item
      key={Id.generate('menu-item')}
      iconResolver={iconResolver}
      icon={<Icon resolver={iconResolver} icon='item'></Icon>}
      autoFocus={true}
      // eslint-disable-next-line no-console
      onAction= {() => console.log('Clicked Menu item 1')}
    >
      {'Menu item 1'}
    </Menu.Item>
    <Menu.ToggleItem
      key={Id.generate('menu-item')}
      iconResolver={iconResolver}
      icon={'item'}
      onAction= {(api: ToggleMenuItemInstanceApi): void => {
        api.setActive(!api.isActive());
        // eslint-disable-next-line no-console
        console.log('You toggled a menuitem');
      }}
    >
      <span>Menu <span style={{ textDecoration: 'underline' }}>item  2</span></span>
    </Menu.ToggleItem>
    <Menu.SubmenuItem
      key={Id.generate('menu-item')}
      iconResolver={iconResolver}
      icon={'item'}
      submenuContent={
        <Menu.Root>
          <Menu.Item
            autoFocus={true}
            key={Id.generate('menu-item')}
            iconResolver={iconResolver}
            icon={'item'}
            // eslint-disable-next-line no-console
            onAction= {() => console.log('Clicked nested menu item 1')}
          >
            {'Nested menu item 1'}
          </Menu.Item>
          <Menu.ToggleItem
            enabled={false}
            key={Id.generate('menu-item')}
            iconResolver={iconResolver}
            icon={'item'}
            onAction= {(api: ToggleMenuItemInstanceApi): void => {
              api.setActive(!api.isActive());
              // eslint-disable-next-line no-console
              console.log('You toggled a nested menu item 2');
            }}
          >
            {'Nested menu item 2'}
          </Menu.ToggleItem>
          <Menu.SubmenuItem
            key={Id.generate('menu-item')}
            iconResolver={iconResolver}
            icon={'item'}
            submenuContent={
              <Menu.Root>
                <Menu.Item
                  autoFocus={true}
                  key={Id.generate('menu-item')}
                  iconResolver={iconResolver}
                  icon={'item'}
                  // eslint-disable-next-line no-console
                  onAction= {() => console.log('Clicked nested menu item 1')}
                >
                  {'Nested menu item 1'}
                </Menu.Item>
                <Menu.ToggleItem
                  key={Id.generate('menu-item')}
                  iconResolver={iconResolver}
                  icon={'item'}
                  onAction= {(api: ToggleMenuItemInstanceApi): void => {
                    api.setActive(!api.isActive());
                    // eslint-disable-next-line no-console
                    console.log('You toggled a nested menu item 2');
                  }}
                >
                  {'Nested menu item 2'}
                </Menu.ToggleItem>
              </Menu.Root>
            }>
            {'Submenu'}
          </Menu.SubmenuItem>
        </Menu.Root>
      }>
      {'Submenu'}
    </Menu.SubmenuItem>
  </Menu.Root>);

export const Example: Story = {
  args: {},
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render: Fun.constant(menu)
};

export const MenuInADropdown: Story = {
  args: {},
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render: (): JSX.Element => {
    return (<>
      <Dropdown.Root>
        <Dropdown.Trigger>
          <IconButton variant={'secondary'} resolver={iconResolver} icon={'item'}></IconButton>
        </Dropdown.Trigger>
        <Dropdown.Content>
          {menu}
        </Dropdown.Content>
      </Dropdown.Root>
    </>);
  }
};

