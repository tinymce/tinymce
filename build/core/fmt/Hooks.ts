/**
 * Hooks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Arr from '../util/Arr';
import NodeType from '../dom/NodeType';
import $ from '../api/dom/DomQuery';

/**
 * Internal class for overriding formatting.
 *
 * @private
 * @class tinymce.fmt.Hooks
 */

const postProcessHooks = {}, filter = Arr.filter, each = Arr.each;

const addPostProcessHook = function (name, hook) {
  let hooks = postProcessHooks[name];

  if (!hooks) {
    postProcessHooks[name] = hooks = [];
  }

  postProcessHooks[name].push(hook);
};

const postProcess = function (name, editor) {
  each(postProcessHooks[name], function (hook) {
    hook(editor);
  });
};

addPostProcessHook('pre', function (editor) {
  const rng = editor.selection.getRng();
  let isPre, blocks;

  const hasPreSibling = function (pre) {
    return isPre(pre.previousSibling) && Arr.indexOf(blocks, pre.previousSibling) !== -1;
  };

  const joinPre = function (pre1, pre2) {
    $(pre2).remove();
    $(pre1).append('<br><br>').append(pre2.childNodes);
  };

  isPre = NodeType.matchNodeNames('pre');

  if (!rng.collapsed) {
    blocks = editor.selection.getSelectedBlocks();

    each(filter(filter(blocks, isPre), hasPreSibling), function (pre) {
      joinPre(pre.previousSibling, pre);
    });
  }
});

export default {
  postProcess
};