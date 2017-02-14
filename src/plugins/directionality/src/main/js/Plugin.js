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
 * This class contains all core logic for the directionality plugin.
 *
 * @class tinymce.directionality.Plugin
 * @private
 */
define(
  'tinymce.plugins.directionality.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.util.Tools'
  ],
  function (PluginManager, Tools) {
    PluginManager.add('directionality', function (editor) {
      function setDir(dir) {
        var dom = editor.dom, curDir, blocks = editor.selection.getSelectedBlocks();

        if (blocks.length) {
          curDir = dom.getAttrib(blocks[0], "dir");

          Tools.each(blocks, function (block) {
            // Add dir to block if the parent block doesn't already have that dir
            if (!dom.getParent(block.parentNode, "*[dir='" + dir + "']", dom.getRoot())) {
              if (curDir != dir) {
                dom.setAttrib(block, "dir", dir);
              } else {
                dom.setAttrib(block, "dir", null);
              }
            }
          });

          editor.nodeChanged();
        }
      }

      function generateSelector(dir) {
        var selector = [];

        Tools.each('h1 h2 h3 h4 h5 h6 div p'.split(' '), function (name) {
          selector.push(name + '[dir=' + dir + ']');
        });

        return selector.join(',');
      }

      editor.addCommand('mceDirectionLTR', function () {
        setDir("ltr");
      });

      editor.addCommand('mceDirectionRTL', function () {
        setDir("rtl");
      });

      editor.addButton('ltr', {
        title: 'Left to right',
        cmd: 'mceDirectionLTR',
        stateSelector: generateSelector('ltr')
      });

      editor.addButton('rtl', {
        title: 'Right to left',
        cmd: 'mceDirectionRTL',
        stateSelector: generateSelector('rtl')
      });
    });

    return function () { };
  }
);