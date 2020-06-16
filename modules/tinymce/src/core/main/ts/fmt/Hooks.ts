/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomQuery from '../api/dom/DomQuery';
import Editor from '../api/Editor';
import * as NodeType from '../dom/NodeType';
import * as ArrUtils from '../util/ArrUtils';

/**
 * Internal class for overriding formatting.
 *
 * @private
 * @class tinymce.fmt.Hooks
 */

const postProcessHooks = {}, filter = ArrUtils.filter, each = ArrUtils.each;

const addPostProcessHook = function (name, hook) {
  const hooks = postProcessHooks[name];

  if (!hooks) {
    postProcessHooks[name] = [];
  }

  postProcessHooks[name].push(hook);
};

const postProcess = function (name: string, editor: Editor) {
  each(postProcessHooks[name], function (hook) {
    hook(editor);
  });
};

addPostProcessHook('pre', function (editor: Editor) {
  const rng = editor.selection.getRng();
  let blocks;

  const hasPreSibling = function (pre) {
    return isPre(pre.previousSibling) && ArrUtils.indexOf(blocks, pre.previousSibling) !== -1;
  };

  const joinPre = function (pre1, pre2) {
    DomQuery(pre2).remove();
    DomQuery(pre1).append('<br><br>').append(pre2.childNodes);
  };

  const isPre = NodeType.matchNodeNames([ 'pre' ]);

  if (!rng.collapsed) {
    blocks = editor.selection.getSelectedBlocks();

    each(filter(filter(blocks, isPre), hasPreSibling), function (pre) {
      joinPre(pre.previousSibling, pre);
    });
  }
});

export {
  postProcess
};
