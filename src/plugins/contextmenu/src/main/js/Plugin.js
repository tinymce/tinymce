/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the contextmenu plugin.
 *
 * @class tinymce.contextmenu.Plugin
 * @private
 */
define(
  'tinymce.plugins.contextmenu.Plugin',
  [
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.Env',
    'tinymce.core.PluginManager',
    'tinymce.core.ui.Menu',
    'tinymce.core.util.Tools'
  ],
  function (DOMUtils, Env, PluginManager, Menu, Tools) {
    var DOM = DOMUtils.DOM;

    PluginManager.add('contextmenu', function (editor) {
      var menu, visibleState, contextmenuNeverUseNative = editor.settings.contextmenu_never_use_native;

      var isNativeOverrideKeyEvent = function (e) {
        return e.ctrlKey && !contextmenuNeverUseNative;
      };

      var isMacWebKit = function () {
        return Env.mac && Env.webkit;
      };

      var isContextMenuVisible = function () {
        return visibleState === true;
      };

      /**
       * This takes care of a os x native issue where it expands the selection
       * to the word at the caret position to do "lookups". Since we are overriding
       * the context menu we also need to override this expanding so the behavior becomes
       * normalized. Firefox on os x doesn't expand to the word when using the context menu.
       */
      editor.on('mousedown', function (e) {
        if (isMacWebKit() && e.button === 2 && !isNativeOverrideKeyEvent(e)) {
          if (editor.selection.isCollapsed()) {
            editor.once('contextmenu', function (e) {
              editor.selection.placeCaretAt(e.clientX, e.clientY);
            });
          }
        }
      });

      editor.on('contextmenu', function (e) {
        var contextmenu;

        if (isNativeOverrideKeyEvent(e)) {
          return;
        }

        e.preventDefault();
        contextmenu = editor.settings.contextmenu || 'link openlink image inserttable | cell row column deletetable';

        // Render menu
        if (!menu) {
          var items = [];

          Tools.each(contextmenu.split(/[ ,]/), function (name) {
            var item = editor.menuItems[name];

            if (name == '|') {
              item = { text: name };
            }

            if (item) {
              item.shortcut = ''; // Hide shortcuts
              items.push(item);
            }
          });

          for (var i = 0; i < items.length; i++) {
            if (items[i].text == '|') {
              if (i === 0 || i == items.length - 1) {
                items.splice(i, 1);
              }
            }
          }

          menu = new Menu({
            items: items,
            context: 'contextmenu',
            classes: 'contextmenu'
          }).renderTo();

          menu.on('hide', function (e) {
            if (e.control === this) {
              visibleState = false;
            }
          });

          editor.on('remove', function () {
            menu.remove();
            menu = null;
          });

        } else {
          menu.show();
        }

        // Position menu
        var pos = { x: e.pageX, y: e.pageY };

        if (!editor.inline) {
          pos = DOM.getPos(editor.getContentAreaContainer());
          pos.x += e.clientX;
          pos.y += e.clientY;
        }

        menu.moveTo(pos.x, pos.y);
        visibleState = true;
      });

      return {
        isContextMenuVisible: isContextMenuVisible
      };
    });
    return function () { };
  }
);