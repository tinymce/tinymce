/**
 * Hooks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Internal class for overriding formatting.
 *
 * @private
 * @class tinymce.fmt.Hooks
 */
define(
  'tinymce.core.fmt.Hooks',
  [
    "tinymce.core.util.Arr",
    "tinymce.core.dom.NodeType",
    "tinymce.core.dom.DomQuery"
  ],
  function (Arr, NodeType, $) {
    var postProcessHooks = {}, filter = Arr.filter, each = Arr.each;

    function addPostProcessHook(name, hook) {
      var hooks = postProcessHooks[name];

      if (!hooks) {
        postProcessHooks[name] = hooks = [];
      }

      postProcessHooks[name].push(hook);
    }

    function postProcess(name, editor) {
      each(postProcessHooks[name], function (hook) {
        hook(editor);
      });
    }

    addPostProcessHook("pre", function (editor) {
      var rng = editor.selection.getRng(), isPre, blocks;

      function hasPreSibling(pre) {
        return isPre(pre.previousSibling) && Arr.indexOf(blocks, pre.previousSibling) != -1;
      }

      function joinPre(pre1, pre2) {
        $(pre2).remove();
        $(pre1).append('<br><br>').append(pre2.childNodes);
      }

      isPre = NodeType.matchNodeNames('pre');

      if (!rng.collapsed) {
        blocks = editor.selection.getSelectedBlocks();

        each(filter(filter(blocks, isPre), hasPreSibling), function (pre) {
          joinPre(pre.previousSibling, pre);
        });
      }
    });

    return {
      postProcess: postProcess
    };
  }
);
