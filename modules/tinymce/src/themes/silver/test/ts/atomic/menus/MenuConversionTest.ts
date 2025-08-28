import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Menu } from 'tinymce/core/api/ui/Ui';
import * as MenuConversion from 'tinymce/themes/silver/ui/menus/menu/MenuConversion';

describe('atomic.tinymce.themes.silver.menus.MenuConversionTest', () => {
  const buildMenuItem = (name: string): Menu.MenuItemSpec => ({
    type: 'menuitem',
    text: name,
    value: `${name}-value`
  });

  const buildNestedMenuItem = (name: string, submenus: string | Array<Menu.NestedMenuItemContents>): Menu.NestedMenuItemSpec => ({
    type: 'nestedmenuitem',
    text: name,
    value: `${name}-value`,
    getSubmenuItems: () => submenus
  });

  const separator: Menu.SeparatorMenuItemSpec = {
    type: 'separator'
  };

  const menu1 = buildMenuItem('menu-1');
  const menu2 = buildMenuItem('menu-2');
  const submenu1 = buildMenuItem('submenu-1');
  const submenu2a = buildMenuItem('submenu-2a');
  const submenu2 = buildNestedMenuItem('submenu-2', [ submenu2a ]);
  const nestedMenu = buildNestedMenuItem('nested-menu-1', [ submenu1, separator, submenu2 ]);
  const nestedMenuWithReferences = buildNestedMenuItem('nested-menu-2', 'submenu-1 | submenu-2');

  const menuItems = {
    'menu-1': menu1,
    'menu-2': menu2,
    'submenu-1': submenu1,
    'submenu-2': submenu2
  };

  const expandAndAssertEq = (items: string | Array<Menu.NestedMenuItemContents>, expected: MenuConversion.ExpandedMenus) => {
    assert.deepEqual(MenuConversion.expand(items, menuItems), expected);
  };

  // Menu reference
  it('can expand string menu references', () => {
    expandAndAssertEq('menu-1 | menu-2', {
      items: [ menu1, separator, menu2 ],
      menus: {},
      expansions: {}
    });
  });

  // Menu reference array
  it('can expand an array of menu references', () => {
    expandAndAssertEq([ 'menu-1', '|', 'menu-2' ], {
      items: [ menu1, separator, menu2 ],
      menus: {},
      expansions: {}
    });
  });

  // Menu with submenus
  it('can expand nested menus', () => {
    expandAndAssertEq([ nestedMenu ], {
      items: [ nestedMenu ],
      menus: {
        'nested-menu-1-value': [ submenu1, separator, submenu2 ],
        'submenu-2-value': [ submenu2a ]
      },
      expansions: {
        'nested-menu-1-value': 'nested-menu-1-value',
        'submenu-2-value': 'submenu-2-value'
      }
    });
  });

  // Menu with submenu references
  it('can expand nested menus with references', () => {
    expandAndAssertEq([ nestedMenuWithReferences ], {
      items: [ nestedMenuWithReferences ],
      menus: {
        'nested-menu-2-value': [ submenu1, separator, submenu2 ],
        'submenu-2-value': [ submenu2a ]
      },
      expansions: {
        'nested-menu-2-value': 'nested-menu-2-value',
        'submenu-2-value': 'submenu-2-value'
      }
    });
  });
});
