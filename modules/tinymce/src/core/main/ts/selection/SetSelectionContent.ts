/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Options } from '@ephox/katamari';
import { Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import Editor from '../api/Editor';
import HtmlSerializer from '../api/html/Serializer';
import { EditorEvent } from '../api/util/EventDispatcher';
import { SetContentArgs } from '../content/ContentTypes';
import * as ScrollIntoView from '../dom/ScrollIntoView';

export interface SelectionSetContentArgs extends SetContentArgs {
  selection?: boolean;
}

const prependData = (target: Text, data: string): void => {
  target.insertData(0, data);
};

const removeEmpty = (text: SugarElement): Option<SugarElement> => {
  if (text.dom().length === 0) {
    Remove.remove(text);
    return Option.none();
  }
  return Option.some(text);
};

const rngSetContent = (rng: Range, fragment: DocumentFragment): void => {
  const firstChild = Option.from(fragment.firstChild).map(SugarElement.fromDom);
  const lastChild = Option.from(fragment.lastChild).map(SugarElement.fromDom);

  rng.deleteContents();
  rng.insertNode(fragment);

  const prevText = firstChild.bind(Traverse.prevSibling).filter(SugarNode.isText).bind(removeEmpty);
  const nextText = lastChild.bind(Traverse.nextSibling).filter(SugarNode.isText).bind(removeEmpty);

  // Join start
  Options.lift2(prevText, firstChild.filter(SugarNode.isText), (prev: SugarElement, start: SugarElement) => {
    prependData(start.dom(), prev.dom().data);
    Remove.remove(prev);
  });

  // Join end
  Options.lift2(nextText, lastChild.filter(SugarNode.isText), (next: SugarElement, end: SugarElement) => {
    const oldLength = end.dom().length;
    end.dom().appendData(next.dom().data);
    rng.setEnd(end.dom(), oldLength);
    Remove.remove(next);
  });

  rng.collapse(false);
};

const setupArgs = (args: Partial<SelectionSetContentArgs>, content: string): SelectionSetContentArgs => ({
  format: 'html',
  ...args,
  set: true,
  selection: true,
  content
});

const cleanContent = (editor: Editor, args: SelectionSetContentArgs) => {
  if (args.format !== 'raw') {
    const node = editor.parser.parse(args.content, { isRootContent: true, forced_root_block: false, ...args });
    return HtmlSerializer({ validate: editor.validate }, editor.schema).serialize(node);
  } else {
    return args.content;
  }
};

const setContent = (editor: Editor, content: string, args: SelectionSetContentArgs = {}) => {
  // Note: Need to cast as an EditorEvent due to reusing the variable for the editor.fire() return value
  let contentArgs = setupArgs(args, content) as EditorEvent<SelectionSetContentArgs>;

  if (!contentArgs.no_events) {
    contentArgs = editor.fire('BeforeSetContent', contentArgs);
    if (contentArgs.isDefaultPrevented()) {
      editor.fire('SetContent', contentArgs);
      return;
    }
  }

  // Sanitize the content
  args.content = cleanContent(editor, contentArgs);

  const rng = editor.selection.getRng();
  rngSetContent(rng, rng.createContextualFragment(args.content));
  editor.selection.setRng(rng);

  ScrollIntoView.scrollRangeIntoView(editor, rng);

  if (!contentArgs.no_events) {
    editor.fire('SetContent', contentArgs);
  }
};

export {
  setContent
};
