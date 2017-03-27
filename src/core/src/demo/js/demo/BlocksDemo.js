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

    var html = function (name, attrs, child) {
      var children = Array.prototype.slice.call(arguments, 2);
      var elm = document.createElement(name);

      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          elm.setAttribute(key, attrs[key]);
        }
      }

      children.forEach(function (child) {
        elm.appendChild(child);
      });

      return elm;
    };

    var createHtml = function (f) {
      return f(html);
    };

    var editable = function (elm, selector) {
      elm.querySelector(selector).setAttribute('contenteditable', 'true');
    };

    var registerBlocks = function (editor) {
      editor.blocks.register('blockquote', {
        title: 'Block quote',
        icon: 'blockquote',
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
          callback(createHtml(function (h) {
            return h('blockquote', { },
              h('p', { contenteditable: 'true', 'data-mce-block-placeholder': 'Write quote\u2026' }),
              h('footer', { contenteditable: 'true', 'data-mce-block-placeholder': 'Write citation\u2026' })
            );
          }));
        },

        load: function (api) {
          editable(api.dom(), 'p');
          editable(api.dom(), 'footer');
          return api.dom();
        }
      });

      editor.blocks.register('figure', {
        title: 'Figure',
        icon: 'image',
        toolbar: [
          {
            icon: 'remove',
            tooltip: 'Remove figure',
            action: function (api) {
              api.remove();
            }
          },

          {
            icon: 'settings',
            tooltip: 'Unselect figure',
            action: function (api) {
              api.unselect();
            }
          },

          {
            icon: 'alignleft',
            tooltip: 'Align left',
            selectorSelected: '.alignleft',
            action: function (api) {
              api.dom().className = 'alignleft';
            }
          },

          {
            icon: 'aligncenter',
            tooltip: 'Align center',
            selectorSelected: '*:not(.alignleft):not(.alignright)',
            action: function (api) {
              api.dom().className = '';
            }
          },

          {
            icon: 'alignright',
            tooltip: 'Align right',
            selectorSelected: '.alignright',
            action: function (api) {
              api.dom().className = 'alignright';
            }
          }
        ],

        insert: function (api, callback) {
          callback(createHtml(function (h) {
            return h('figure', { },
              h('img', { src: 'https://cldup.com/Bc9YxmqFnJ.jpg' }),
              h('figcaption', { contenteditable: 'true', 'data-mce-block-placeholder': 'Write caption\u2026' })
            );
          }));
        },

        load: function (api) {
          editable(api.dom(), 'figcaption');
          return api.dom();
        }
      });

      editor.blocks.register('hr', {
        title: 'Hr',
        icon: 'hr',
        toolbar: [
          {
            icon: 'remove',
            tooltip: 'Remove block',
            action: function (api) {
              api.remove();
            }
          }
        ],

        insert: function (api, callback) {
          callback(createHtml(function (h) {
            return h('hr');
          }));
        }
      });
    };

    var registerButtons = function (editor) {
      Arr.each(editor.blocks.getAll(), function (spec) {
        editor.addButton('insert-' + spec.id(), {
          tooltip: spec.title(),
          icon: spec.icon(),
          onclick: function () {
            editor.blocks.insert(spec.id());
          }
        });
      });
    };

    var registerToolbars = function (editor) {
      Arr.each(editor.blocks.getAll(), function (spec) {
        var toolbar = Arr.map(spec.toolbar(), function (item) {
          var uuid = Uuid.uuid('btn');

          editor.addButton(uuid, {
            icon: item.icon(),
            tooltip: item.tooltip(),
            onPostrender: function (e) {
              var selector = item.selectorSelected();
              var control = e.control;

              if (selector) {
                editor.selection.selectorChanged('*[data-mce-block-type]' + selector, function (state) {
                  control.active(state);
                });
              }
            },
            onclick: function () {
              var action = item.action();
              action(editor.blocks.createApi(editor.selection.getNode(), spec));
              editor.nodeChanged();
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
      insert_toolbar: 'insert-blockquote insert-figure insert-hr',
      selection_toolbar: 'bold italic | quicklink',
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
