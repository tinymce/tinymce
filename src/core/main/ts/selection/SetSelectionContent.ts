/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from '../api/Editor';
import ScrollIntoView from '../dom/ScrollIntoView';
import { Range, DocumentFragment, Text } from '@ephox/dom-globals';
import { Option, Options } from '@ephox/katamari';
import { Element, Traverse, Remove } from '@ephox/sugar';
import NodeType from '../dom/NodeType';

const isText = (el: Element): boolean => NodeType.isText(el.dom());

const prependData = (target: Text, data: string): void => {
  target.insertData(0, data);
};

// Wrapper to rng.insertNode which takes care of empty and splitted text nodes
const rngInsertNode = (rng: Range, fragment: DocumentFragment): void => {
  const startFragmentText = Option.from(fragment.firstChild).map(Element.fromDom).filter(isText);
  const endFragmentText = Option.from(fragment.lastChild).map(Element.fromDom).filter(isText);

  rng.insertNode(fragment);

  const prevText = startFragmentText.bind(Traverse.prevSibling).filter(isText);
  const nextText = endFragmentText.bind(Traverse.nextSibling).filter(isText);

  // Join start
  Options.liftN([prevText, startFragmentText], (prev: Element, startFrag: Element) => {
    prependData(startFrag.dom(), prev.dom().data);
    rng.setStart(startFrag.dom(), prev.dom().length);
    Remove.remove(prev);
  });

  // Join end
  Options.liftN([nextText, endFragmentText], (next: Element, endFrag: Element) => {
    const oldLength = endFrag.dom().length;
    endFrag.dom().appendData(next.dom().data);
    rng.setEnd(endFrag.dom(), oldLength);
    Remove.remove(next);
  });
};

const setupArgs = (args, content: string) => {
  args = args || { format: 'html' };
  args.set = true;
  args.selection = true;
  args.content = content;
  return args;
};

const setContent = (editor: Editor, content: string, args) => {
  args = setupArgs(args, content); // mutates

  if (!args.no_events) {
    args = editor.fire('BeforeSetContent', args);
    if (args.isDefaultPrevented()) {
      editor.fire('SetContent', args);
      return;
    }
  }

  const rng = editor.selection.getRng();

  rng.deleteContents();
  rngInsertNode(rng, rng.createContextualFragment(args.content));

  rng.collapse(false);
  editor.selection.setRng(rng);
  ScrollIntoView.scrollRangeIntoView(editor, rng);

  if (!args.no_events) {
    editor.fire('SetContent', args);
  }
};

export default {
  setContent
};