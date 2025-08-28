import { Arr, Obj } from '@ephox/katamari';
import { InsertAll, Remove, SugarElement, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as NodeType from '../dom/NodeType';

/**
 * Internal class for overriding formatting.
 *
 * @private
 * @class tinymce.fmt.Hooks
 */

type Hook = (editor: Editor) => void;

const postProcessHooks: Record<string, Hook[]> = {};

const isPre = NodeType.matchNodeNames<HTMLPreElement>([ 'pre' ]);

const addPostProcessHook = (name: string, hook: Hook): void => {
  const hooks = postProcessHooks[name];

  if (!hooks) {
    postProcessHooks[name] = [];
  }

  postProcessHooks[name].push(hook);
};

const postProcess = (name: string, editor: Editor): void => {
  if (Obj.has(postProcessHooks, name)) {
    Arr.each(postProcessHooks[name], (hook) => {
      hook(editor);
    });
  }
};

addPostProcessHook('pre', (editor) => {
  const rng = editor.selection.getRng();

  const hasPreSibling = (blocks: Element[]) => (pre: HTMLPreElement) => {
    const prev = pre.previousSibling;
    return isPre(prev) && Arr.contains(blocks, prev);
  };

  const joinPre = (pre1: HTMLPreElement, pre2: HTMLPreElement) => {
    const sPre2 = SugarElement.fromDom(pre2);
    const doc = Traverse.documentOrOwner(sPre2).dom;
    Remove.remove(sPre2);
    InsertAll.append(SugarElement.fromDom(pre1), [
      SugarElement.fromTag('br', doc),
      SugarElement.fromTag('br', doc),
      ...Traverse.children(sPre2)
    ]);
  };

  if (!rng.collapsed) {
    const blocks = editor.selection.getSelectedBlocks();

    const preBlocks = Arr.filter(Arr.filter(blocks, isPre), hasPreSibling(blocks));
    Arr.each(preBlocks, (pre) => {
      joinPre(pre.previousSibling as HTMLPreElement, pre);
    });
  }
});

export {
  postProcess
};
