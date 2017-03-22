/**
 * Menubar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.themes.modern.ui.Menubar',
  [
    'tinymce.core.util.Tools'
  ],
  function (Tools) {
    var defaultMenus = {
      file: { title: 'File', items: 'newdocument' },
      edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall' },
      insert: { title: 'Insert', items: '|' },
      view: { title: 'View', items: 'visualaid |' },
      format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats | removeformat' },
      table: { title: 'Table' },
      tools: { title: 'Tools' }
    };

    var createMenuItem = function (menuItems, name) {
      var menuItem;

      if (name == '|') {
        return { text: '|' };
      }

      menuItem = menuItems[name];

      return menuItem;
    };

    var createMenu = function (editorMenuItems, settings, context) {
      var menuButton, menu, menuItems, isUserDefined, removedMenuItems;

      removedMenuItems = Tools.makeMap((settings.removed_menuitems || '').split(/[ ,]/));

      // User defined menu
      if (settings.menu) {
        menu = settings.menu[context];
        isUserDefined = true;
      } else {
        menu = defaultMenus[context];
      }

      if (menu) {
        menuButton = { text: menu.title };
        menuItems = [];

        // Default/user defined items
        Tools.each((menu.items || '').split(/[ ,]/), function (item) {
          var menuItem = createMenuItem(editorMenuItems, item);

          if (menuItem && !removedMenuItems[item]) {
            menuItems.push(createMenuItem(editorMenuItems, item));
          }
        });

        // Added though context
        if (!isUserDefined) {
          Tools.each(editorMenuItems, function (menuItem) {
            if (menuItem.context == context) {
              if (menuItem.separator == 'before') {
                menuItems.push({ text: '|' });
              }

              if (menuItem.prependToContext) {
                menuItems.unshift(menuItem);
              } else {
                menuItems.push(menuItem);
              }

              if (menuItem.separator == 'after') {
                menuItems.push({ text: '|' });
              }
            }
          });
        }

        for (var i = 0; i < menuItems.length; i++) {
          if (menuItems[i].text == '|') {
            if (i === 0 || i == menuItems.length - 1) {
              menuItems.splice(i, 1);
            }
          }
        }

        menuButton.menu = menuItems;

        if (!menuButton.menu.length) {
          return null;
        }
      }

      return menuButton;
    };

    var createMenuButtons = function (editor) {
      var name, menuButtons = [], settings = editor.settings;

      var defaultMenuBar = [];
      if (settings.menu) {
        for (name in settings.menu) {
          defaultMenuBar.push(name);
        }
      } else {
        for (name in defaultMenus) {
          defaultMenuBar.push(name);
        }
      }

      var enabledMenuNames = typeof settings.menubar == "string" ? settings.menubar.split(/[ ,]/) : defaultMenuBar;
      for (var i = 0; i < enabledMenuNames.length; i++) {
        var menu = enabledMenuNames[i];
        menu = createMenu(editor.menuItems, editor.settings, menu);

        if (menu) {
          menuButtons.push(menu);
        }
      }

      return menuButtons;
    };

    return {
      createMenuButtons: createMenuButtons
    };
  }
);
