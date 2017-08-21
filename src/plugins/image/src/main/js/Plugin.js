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
 * This class contains all core logic for the image plugin.
 *
 * @class tinymce.image.Plugin
 * @private
 */
define(
  'tinymce.plugins.image.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.util.Tools',
    'tinymce.plugins.image.ui.Dialog'
  ],
  function (PluginManager, Tools, Dialog) {
    PluginManager.add('image', function (editor) {

      editor.on('preInit', function () {
        function hasImageClass(node) {
          var className = node.attr('class');
          return className && /\bimage\b/.test(className);
        }

        function toggleContentEditableState(state) {
          return function (nodes) {
            var i = nodes.length, node;

            function toggleContentEditable(node) {
              node.attr('contenteditable', state ? 'true' : null);
            }

            while (i--) {
              node = nodes[i];

              if (hasImageClass(node)) {
                node.attr('contenteditable', state ? 'false' : null);
                Tools.each(node.getAll('figcaption'), toggleContentEditable);
              }
            }
          };
        }

        editor.parser.addNodeFilter('figure', toggleContentEditableState(true));
        editor.serializer.addNodeFilter('figure', toggleContentEditableState(false));
      });

      editor.addButton('image', {
        icon: 'image',
        tooltip: 'Insert/edit image',
        onclick: Dialog(editor).open,
        stateSelector: 'img:not([data-mce-object],[data-mce-placeholder]),figure.image'
      });

      editor.addMenuItem('image', {
        icon: 'image',
        text: 'Image',
        onclick: Dialog(editor).open,
        context: 'insert',
        prependToContext: true
      });

      editor.addCommand('mceImage', Dialog(editor).open);
    });

    return function () { };
  }
);