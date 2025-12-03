import { Arr, Id } from '@ephox/katamari';

import { SimpleMenuItem } from '../components/SimpleMenuItem';
import { SubmenuItem } from '../components/SubmenuItem';
import { ToggleMenuItem } from '../components/ToggleMenuItem';
import { Menu } from '../Menu';

import type { MenuItem } from './Types';

export interface MenuRendererProps {
  readonly items: MenuItem[];
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

export const render = ({ items, iconResolver, submenusSide }: MenuRendererProps): JSX.Element => {
  const itemsWithId = Arr.map(items, (itemProps) => ({ ...itemProps, id: Id.generate('menu-item') }));

  return (<Menu>
    {
      Arr.map(itemsWithId, (itemProps) => {
        if (itemProps.type === 'togglemenuitem') {
          return (<ToggleMenuItem
            iconResolver={iconResolver}
            key={itemProps.id}
            {...itemProps}
          />);
        }
        if (itemProps.type === 'menuitem') {
          return (<SimpleMenuItem
            iconResolver={iconResolver}
            key={itemProps.id}
            {...itemProps}
          />);
        }
        if (itemProps.type === 'submenu') {
          return (<SubmenuItem
            submenusSide={submenusSide}
            iconResolver={iconResolver}
            key={itemProps.id}
            {...itemProps}
          >
            {render({ items: itemProps.items, iconResolver, submenusSide })}
          </SubmenuItem>);
        }
      })
    }
  </Menu>);
};