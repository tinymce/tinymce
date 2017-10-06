/**
 * InsertButton.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.editorui.InsertButton',
  [
    'ephox.katamari.api.Arr',
    'tinymce.core.util.Tools'
  ],
  function (Arr, Tools) {
    var flatten = function (ar) {
      return Arr.foldl(ar, function (result, item) {
        return result.concat(item);
      }, []);
    };

    var createCustomMenuItems = function (editor, names) {
      var items, nameList;

      if (typeof names === 'string') {
        nameList = names.split(' ');
      } else if (Tools.isArray(names)) {
        return flatten(Tools.map(names, function (names) {
          return createCustomMenuItems(editor, names);
        }));
      }

      items = Tools.grep(nameList, function (name) {
        return name === '|' || name in editor.menuItems;
      });

      return Tools.map(items, function (name) {
        return name === '|' ? { text: '-' } : editor.menuItems[name];
      });
    };

    var trimMenuItems = function (menuItems) {
      var outputMenuItems = menuItems;

      if (outputMenuItems.length > 0 && outputMenuItems[0].text === '-') {
        outputMenuItems = outputMenuItems.slice(1);
      }

      if (outputMenuItems.length > 0 && outputMenuItems[outputMenuItems.length - 1].text === '-') {
        outputMenuItems = outputMenuItems.slice(0, outputMenuItems.length - 1);
      }

      return outputMenuItems;
    };

    var createContextMenuItems = function (editor, context) {
      var outputMenuItems = [{ text: '-' }];
      var menuItems = Tools.grep(editor.menuItems, function (menuItem) {
        return menuItem.context === context;
      });

      Tools.each(menuItems, function (menuItem) {
        if (menuItem.separator === 'before') {
          outputMenuItems.push({ text: '|' });
        }

        if (menuItem.prependToContext) {
          outputMenuItems.unshift(menuItem);
        } else {
          outputMenuItems.push(menuItem);
        }

        if (menuItem.separator === 'after') {
          outputMenuItems.push({ text: '|' });
        }
      });

      return outputMenuItems;
    };

    var createInsertMenu = function (editor) {
      var insertButtonItems = editor.settings.insert_button_items;

      if (insertButtonItems) {
        return trimMenuItems(createCustomMenuItems(editor, insertButtonItems));
      } else {
        return trimMenuItems(createContextMenuItems(editor, 'insert'));
      }
    };

    var registerButtons = function (editor) {
      editor.addButton('insert', {
        type: 'menubutton',
        icon: 'insert',
        menu: [],
        oncreatemenu: function () {
          this.menu.add(createInsertMenu(editor));
          this.menu.renderNew();
        }
      });
    };

    var register = function (editor) {
      registerButtons(editor);
    };

    return {
      register: register
    };
  }
);
