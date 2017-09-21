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
 * This class contains all core logic for the advlist plugin.
 *
 * @class tinymce.plugins.advlist.Plugin
 * @private
 */
define(
  'tinymce.plugins.advlist.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.util.Tools'
  ],
  function (PluginManager, Tools) {
    PluginManager.add('advlist', function (editor) {
      var olMenuItems, ulMenuItems;

      var hasPlugin = function (editor, plugin) {
        var plugins = editor.settings.plugins ? editor.settings.plugins : '';
        return Tools.inArray(plugins.split(/[ ,]/), plugin) !== -1;
      };

      function isChildOfBody(elm) {
        return editor.$.contains(editor.getBody(), elm);
      }

      function isListNode(node) {
        return node && (/^(OL|UL|DL)$/).test(node.nodeName) && isChildOfBody(node);
      }

      function buildMenuItems(listName, styleValues) {
        var items = [];
        if (styleValues) {
          Tools.each(styleValues.split(/[ ,]/), function (styleValue) {
            items.push({
              text: styleValue.replace(/\-/g, ' ').replace(/\b\w/g, function (chr) {
                return chr.toUpperCase();
              }),
              data: styleValue == 'default' ? '' : styleValue
            });
          });
        }
        return items;
      }

      olMenuItems = buildMenuItems('OL', editor.getParam(
        "advlist_number_styles",
        "default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman"
      ));

      ulMenuItems = buildMenuItems('UL', editor.getParam("advlist_bullet_styles", "default,circle,disc,square"));

      function applyListFormat(listName, styleValue) {
        var cmd = listName == 'UL' ? 'InsertUnorderedList' : 'InsertOrderedList';
        editor.execCommand(cmd, false, styleValue === false ? null : { 'list-style-type': styleValue });
      }

      function updateSelection(e) {
        var listStyleType = editor.dom.getStyle(editor.dom.getParent(editor.selection.getNode(), 'ol,ul'), 'listStyleType') || '';

        e.control.items().each(function (ctrl) {
          ctrl.active(ctrl.settings.data === listStyleType);
        });
      }

      var listState = function (listName) {
        return function () {
          var self = this;

          editor.on('NodeChange', function (e) {
            var lists = Tools.grep(e.parents, isListNode);
            self.active(lists.length > 0 && lists[0].nodeName === listName);
          });
        };
      };

      if (hasPlugin(editor, "lists")) {
        editor.addCommand('ApplyUnorderedListStyle', function (ui, value) {
          applyListFormat('UL', value['list-style-type']);
        });

        editor.addCommand('ApplyOrderedListStyle', function (ui, value) {
          applyListFormat('OL', value['list-style-type']);
        });

        editor.addButton('numlist', {
          type: (olMenuItems.length > 0) ? 'splitbutton' : 'button',
          tooltip: 'Numbered list',
          menu: olMenuItems,
          onPostRender: listState('OL'),
          onshow: updateSelection,
          onselect: function (e) {
            applyListFormat('OL', e.control.settings.data);
          },
          onclick: function () {
            editor.execCommand('InsertOrderedList');
          }
        });

        editor.addButton('bullist', {
          type: (ulMenuItems.length > 0) ? 'splitbutton' : 'button',
          tooltip: 'Bullet list',
          onPostRender: listState('UL'),
          menu: ulMenuItems,
          onshow: updateSelection,
          onselect: function (e) {
            applyListFormat('UL', e.control.settings.data);
          },
          onclick: function () {
            editor.execCommand('InsertUnorderedList');
          }
        });
      }
    });

    return function () { };

  }
);