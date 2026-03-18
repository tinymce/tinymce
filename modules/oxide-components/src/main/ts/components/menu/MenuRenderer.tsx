import { Arr, Id } from '@ephox/katamari';

import type { CommonMenuItemInstanceApi, ToggleMenuItemInstanceApi } from './internals/Types';
import * as Menu from './Menu';

interface CommmonMenuItem {
  readonly icon?: string;
  readonly text?: string;
  readonly enabled?: boolean;
}

interface ToggleMenuItem extends CommmonMenuItem {
  readonly type: 'togglemenuitem';
  readonly active?: boolean;
  readonly shortcut?: string;
  readonly onAction: (api: ToggleMenuItemInstanceApi) => void;
  readonly onSetup?: (api: ToggleMenuItemInstanceApi) => (api: ToggleMenuItemInstanceApi) => void;
}

interface MenuItem extends CommmonMenuItem {
  readonly type: 'menuitem';
  readonly shortcut?: string;
  readonly onAction: (api: CommonMenuItemInstanceApi) => void;
  readonly onSetup?: (api: CommonMenuItemInstanceApi) => (api: CommonMenuItemInstanceApi) => void;
}

interface Submenu extends CommmonMenuItem {
  readonly type: 'submenu';
  readonly items: MenuPart[];
  readonly onSetup?: (api: CommonMenuItemInstanceApi) => (api: CommonMenuItemInstanceApi) => void;
}

type MenuPart = ToggleMenuItem | MenuItem | Submenu;

interface MenuRendererProps {
  readonly items: MenuPart[];
  readonly submenusSide?: 'left' | 'right';
}

export const render = ({ items, submenusSide = 'right' }: MenuRendererProps): JSX.Element => {
  const itemsWithId = Arr.map(items, (itemProps, i) => {
    return {
      id: Id.generate('menu-item'),
      ...(i === 0 && { autoFocus: true }),
      ...itemProps
    };
  });

  return (
    <Menu.Root>
      {
        Arr.map(itemsWithId, (itemProps) => {
          if (itemProps.type === 'togglemenuitem') {
            const { id, type, text, ...props } = itemProps;
            return (
              <Menu.ToggleItem
                key={itemProps.id}
                {...props}
              >
                {text}
              </Menu.ToggleItem>
            );
          }
          if (itemProps.type === 'menuitem') {
            const { id, type, text, ...props } = itemProps;
            return (
              <Menu.Item
                key={itemProps.id}
                {...props}
              >
                {text}
              </Menu.Item>
            );
          }
          if (itemProps.type === 'submenu') {
            const { id, items, type, text, ...props } = itemProps;
            return (
              <Menu.SubmenuItem
                submenusSide={submenusSide}
                key={itemProps.id}
                {...props}
                submenuContent={render({ items: itemProps.items, submenusSide })}
              >
                {text}
              </Menu.SubmenuItem>
            );
          }
        })
      }
    </Menu.Root>
  );
};
