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
  /*
   * The function to resolve the icon name to an html string.
   * This would eventually default to retrieving the icon from the editor's registry.
   * (name: string) => editor.ui.registry.getAll().icons[name] ?? 'temporary-placeholder'
   *
   * @param icon - The name of the icon
   * @returns The html string representation of the icon
   */
  readonly iconResolver: (icon: string) => string;
  readonly submenusSide?: 'left' | 'right';
}

export const render = ({ items, iconResolver, submenusSide = 'right' }: MenuRendererProps): JSX.Element => {
  const itemsWithId = Arr.map(items, (itemProps, i) => {
    return {
      id: Id.generate('menu-item'),
      ...(i === 0 && { autoFocus: true }),
      ...itemProps
    };
  });

  return (<Menu.Root>
    {
      Arr.map(itemsWithId, (itemProps) => {
        if (itemProps.type === 'togglemenuitem') {
          const { id, type, text, ...props } = itemProps;
          return (<Menu.ToggleItem
            iconResolver={iconResolver}
            key={itemProps.id}
            {...props}
          >
            {text}
          </Menu.ToggleItem>);
        }
        if (itemProps.type === 'menuitem') {
          const { id, type, text, ...props } = itemProps;
          return (<Menu.Item
            iconResolver={iconResolver}
            key={itemProps.id}
            {...props}
          >
            {text}
          </Menu.Item>);
        }
        if (itemProps.type === 'submenu') {
          const { id, items, type, text, ...props } = itemProps;
          return (<Menu.SubmenuItem
            submenusSide={submenusSide}
            iconResolver={iconResolver}
            key={itemProps.id}
            {...props}
            submenuContent={render({ items: itemProps.items, iconResolver, submenusSide })}
          >
            {text}
          </Menu.SubmenuItem>);
        }
      })
    }
  </Menu.Root>);
};