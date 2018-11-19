import { assert, UnitTest} from '@ephox/bedrock';
import { Menu } from '@ephox/bridge';
import I18n from 'tinymce/core/api/util/I18n';
import * as MenuConversion from 'tinymce/themes/silver/ui/menus/menu/MenuConversion';

UnitTest.test('themes.silver.ui.menus.MenuConversion', () => {
  const buildMenuItem = (name: string, submenus?: string | (Menu.MenuItemApi | Menu.SeparatorMenuItemApi)[]): Menu.MenuItemApi => {
    return {
      type: 'menuitem',
      text: name,
      value: `${name}-item`,
      ... submenus ? { getSubmenuItems: () => submenus } : {}
    };
  };

  const expandAndAssertEq = (items: string | Menu.MenuItemApi[], expected) => {
    assert.eq(expected, MenuConversion.expand(items, providersBackstage));
  };

  const separator: Menu.SeparatorMenuItemApi = {
    type: 'separator'
  };

  const menu1 = buildMenuItem('menu-1');
  const menu2 = buildMenuItem('menu-2');
  const submenu1 = buildMenuItem('submenu-1');
  const submenu2a = buildMenuItem('submenu-2a');
  const submenu2 = buildMenuItem('submenu-2', [ submenu2a ]);
  const nestedMenu = buildMenuItem('nested-menu-1', [ submenu1, separator, submenu2 ]);
  const nestedMenuWithReferences = buildMenuItem('nested-menu-1', 'submenu-item-1 | submenu-item-2');

  const providersBackstage = {
    icons: () => <Record<string, string>> {},
    menuItems: () => <Record<string, any>> {
      'menu-1': menu1,
      'menu-2': menu2,
      'submenu-1': submenu1,
      'submenu-2': submenu2
    },
    translate: I18n.translate
  };

  // Menu reference
  expandAndAssertEq('menu-1 | menu-2', {
    items: [ menu1, separator, menu2 ],
      menus: { },
      expansions: {  }
    },
  );

  // Menu with submenus
  expandAndAssertEq([ nestedMenu ], {
      items: [ nestedMenu ],
      menus: {
        'menu-item-2': [ submenu1, separator, submenu2 ],
        'submenu-item-2': [ submenu2a ]
      },
      expansions: {
        'menu-item-2': 'menu-item-2',
        'submenu-item-2': 'submenu-item-2'
      }
    }
  );

  // Menu with submenu references
  expandAndAssertEq([ nestedMenuWithReferences ], {
      items: [ nestedMenu ],
      menus: {
        'menu-item-2': [ submenu1, separator, submenu2 ],
        'submenu-item-2': [ submenu2a ]
      },
      expansions: {
        'menu-item-2': 'menu-item-2',
        'submenu-item-2': 'submenu-item-2'
      }
    }
  );
});