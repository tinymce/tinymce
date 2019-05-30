/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import ScrollIntoView from '../dom/ScrollIntoView';
import { Range, DocumentFragment, Text } from '@ephox/dom-globals';
import { Option, Options } from '@ephox/katamari';
import { Element, Traverse, Node, Remove } from '@ephox/sugar';

const prependData = (target: Text, data: string): void => {
  target.insertData(0, data);
};

const removeEmpty = (text: Element): Option<Element> => {
  if (text.dom().length === 0) {
    Remove.remove(text);
    return Option.none();
  }
  return Option.some(text);
};

const rngSetContent = (rng: Range, fragment: DocumentFragment): void => {
  const firstChild = Option.from(fragment.firstChild).map(Element.fromDom);
  const lastChild = Option.from(fragment.lastChild).map(Element.fromDom);

  rng.deleteContents();
  rng.insertNode(fragment);

  const prevText = firstChild.bind(Traverse.prevSibling).filter(Node.isText).bind(removeEmpty);
  const nextText = lastChild.bind(Traverse.nextSibling).filter(Node.isText).bind(removeEmpty);

  // Join start
  Options.liftN([prevText, firstChild.filter(Node.isText)], (prev: Element, start: Element) => {
    prependData(start.dom(), prev.dom().data);
    Remove.remove(prev);
  });

  // Join end
  Options.liftN([nextText, lastChild.filter(Node.isText)], (next: Element, end: Element) => {
    const oldLength = end.dom().length;
    end.dom().appendData(next.dom().data);
    rng.setEnd(end.dom(), oldLength);
    Remove.remove(next);
  });

  rng.collapse(false);
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
  rngSetContent(rng, rng.createContextualFragment(args.content));
  editor.selection.setRng(rng);

  ScrollIntoView.scrollRangeIntoView(editor, rng);

  if (!args.no_events) {
    editor.fire('SetContent', args);
  }
};

export default {
  setContent
};