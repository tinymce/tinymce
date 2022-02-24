import { InsertAll, Remove, SugarElement, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as NodeType from '../dom/NodeType';
import * as ArrUtils from '../util/ArrUtils';

/**
 * Internal class for overriding formatting.
 *
 * @private
 * @class tinymce.fmt.Hooks
 */

const postProcessHooks: Record<string, Array<(editor: Editor) => void>> = {};
const filter = ArrUtils.filter;
const each = ArrUtils.each;

const addPostProcessHook = (name, hook) => {
  const hooks = postProcessHooks[name];

  if (!hooks) {
    postProcessHooks[name] = [];
  }

  postProcessHooks[name].push(hook);
};

const postProcess = (name: string, editor: Editor) => {
  each(postProcessHooks[name], (hook) => {
    hook(editor);
  });
};

addPostProcessHook('pre', (editor: Editor) => {
  const rng = editor.selection.getRng();
  let blocks;

  const hasPreSibling = (pre) => {
    return isPre(pre.previousSibling) && ArrUtils.indexOf(blocks, pre.previousSibling) !== -1;
  };

  const joinPre = (pre1, pre2) => {
    const sPre2 = SugarElement.fromDom(pre2);
    const doc = Traverse.documentOrOwner(sPre2).dom;
    Remove.remove(sPre2);
    InsertAll.append(SugarElement.fromDom(pre1), [
      SugarElement.fromTag('br', doc),
      SugarElement.fromTag('br', doc),
      ...Traverse.children(sPre2)
    ]);
  };

  const isPre = NodeType.matchNodeNames([ 'pre' ]);

  if (!rng.collapsed) {
    blocks = editor.selection.getSelectedBlocks();

    each(filter(filter(blocks, isPre), hasPreSibling), (pre) => {
      joinPre(pre.previousSibling, pre);
    });
  }
});

export {
  postProcess
};
