/**
 * BlocksDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.core.demo.BlocksDemo',
  [
    'ephox.katamari.api.Arr',
    'global!window',
    'tinymce.core.EditorManager',
    'tinymce.core.util.Uuid',
    'tinymce.plugins.anchor.Plugin',
    'tinymce.plugins.autolink.Plugin',
    'tinymce.plugins.contextmenu.Plugin',
    'tinymce.plugins.image.Plugin',
    'tinymce.plugins.link.Plugin',
    'tinymce.plugins.paste.Plugin',
    'tinymce.plugins.table.Plugin',
    'tinymce.plugins.textpattern.Plugin',
    'tinymce.themes.inlite.Theme'
  ],
  function (
    Arr, window, EditorManager, Uuid, AnchorPlugin, AutoLinkPlugin, ContextMenuPlugin, ImagePlugin, LinkPlugin, PastePlugin, TablePlugin, TextPatternPlugin,
    InliteTheme
  ) {
    AnchorPlugin();
    AutoLinkPlugin();
    ContextMenuPlugin();
    ImagePlugin();
    LinkPlugin();
    PastePlugin();
    TablePlugin();
    TextPatternPlugin();
    InliteTheme();

    var registerBlocks = function (editor) {
      editor.blocks.register('my-block', {
        title: 'My block',
        icon: 'my-icon',
        toolbar: [
          {
            icon: 'remove',
            tooltip: 'Remove block',
            action: function (api) {
              api.remove();
            }
          },

          {
            icon: 'settings',
            tooltip: 'Unselect block',
            action: function (api) {
              api.unselect();
            }
          }
        ],
        insert: function (api, callback) {
          var element = document.createElement('div');
          element.innerHTML = 'My fancy block';
          callback(element);
        }
      });
    };

    var registerButtons = function (editor) {
      editor.addButton('my-block', {
        text: 'Block 1',
        onclick: function () {
          editor.blocks.insert('my-block');
        }
      });
    };

    var registerToolbars = function (editor) {
      Arr.each(editor.blocks.getAll(), function (spec) {
        var toolbar = Arr.map(spec.toolbar(), function (item) {
          var uuid = Uuid.uuid('btn');

          editor.addButton(uuid, {
            icon: item.icon(),
            tooltip: item.tooltip(),
            onclick: function () {
              var action = item.action();
              action(editor.blocks.createApi(editor.selection.getNode(), spec));
            }
          });

          return uuid;
        });

        editor.addContextToolbar('*[data-mce-block-type=' + spec.id() + ']', toolbar);
      });
    };

    EditorManager.init({
      selector: 'div.tinymce',
      theme: 'inlite',
      plugins: 'image table link anchor paste contextmenu textpattern autolink',
      skin_url: '../../../../skins/lightgray/dist/lightgray',
      insert_toolbar: 'my-block quickimage quicktable',
      selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
      inline: true,
      paste_data_images: true,
      setup: function (editor) {
        registerBlocks(editor);
        registerButtons(editor);
        registerToolbars(editor);
      }
    });

    window.tinymce = EditorManager;

    return function () { };
  }
);
