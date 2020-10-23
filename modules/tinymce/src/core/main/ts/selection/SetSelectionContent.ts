/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import BookmarkManager from '../api/dom/BookmarkManager';
import Editor from '../api/Editor';
import HtmlSerializer from '../api/html/Serializer';
import { EditorEvent } from '../api/util/EventDispatcher';
import CaretPosition from '../caret/CaretPosition';
import { SetContentArgs } from '../content/ContentTypes';
import * as MergeText from '../delete/MergeText';
import * as ScrollIntoView from '../dom/ScrollIntoView';
import { needsToBeNbspLeft, needsToBeNbspRight } from '../keyboard/Nbsps';

export interface SelectionSetContentArgs extends SetContentArgs {
  selection?: boolean;
}

const removeEmpty = (text: SugarElement<Text>): Optional<SugarElement<Text>> => {
  if (text.dom.length === 0) {
    Remove.remove(text);
    return Optional.none();
  } else {
    return Optional.some(text);
  }
};

const walkPastBookmark = (node: Optional<SugarElement<Node>>, start: boolean): Optional<SugarElement<Node>> =>
  node.filter((elm) => BookmarkManager.isBookmarkNode(elm.dom))
    .bind(start ? Traverse.nextSibling : Traverse.prevSibling);

const merge = (outer: SugarElement<Text>, inner: SugarElement<Text>, rng: Range, start: boolean) => {
  const outerElm = outer.dom;
  const innerElm = inner.dom;
  const oldLength = start ? outerElm.length : innerElm.length;
  if (start) {
    MergeText.mergeTextNodes(outerElm, innerElm, false, !start);
    rng.setStart(innerElm, oldLength);
  } else {
    MergeText.mergeTextNodes(innerElm, outerElm, false, !start);
    rng.setEnd(innerElm, oldLength);
  }
};

const normalizeTextIfRequired = (inner: SugarElement<Text>, start: boolean) => {
  Traverse.parent(inner).each((root) => {
    const text = inner.dom;
    if (start && needsToBeNbspLeft(root, CaretPosition(text, 0))) {
      MergeText.normalizeWhitespaceAfter(text, 0);
    } else if (!start && needsToBeNbspRight(root, CaretPosition(text, text.length))) {
      MergeText.normalizeWhitespaceBefore(text, text.length);
    }
  });
};

const mergeAndNormalizeText = (outerNode: Optional<SugarElement<Text>>, innerNode: Optional<SugarElement<Node>>, rng: Range, start: boolean) => {
  outerNode.bind((outer) => {
    // Normalize the text outside the inserted content
    const normalizer = start ? MergeText.normalizeWhitespaceBefore : MergeText.normalizeWhitespaceAfter;
    normalizer(outer.dom, start ? outer.dom.length : 0);

    // Merge the inserted content with other text nodes
    return innerNode.filter(SugarNode.isText).map((inner) => merge(outer, inner, rng, start));
  }).orThunk(() => {
    // Note: Attempt to leave the inserted/inner content as is and only adjust if absolutely required
    const innerTextNode = walkPastBookmark(innerNode, start).or(innerNode).filter(SugarNode.isText);
    return innerTextNode.map((inner) => normalizeTextIfRequired(inner, start));
  });
};

const rngSetContent = (rng: Range, fragment: DocumentFragment): void => {
  const firstChild = Optional.from(fragment.firstChild).map(SugarElement.fromDom);
  const lastChild = Optional.from(fragment.lastChild).map(SugarElement.fromDom);

  rng.deleteContents();
  rng.insertNode(fragment);

  const prevText = firstChild.bind(Traverse.prevSibling).filter(SugarNode.isText).bind(removeEmpty);
  const nextText = lastChild.bind(Traverse.nextSibling).filter(SugarNode.isText).bind(removeEmpty);

  // Join and normalize text
  mergeAndNormalizeText(prevText, firstChild, rng, true);
  mergeAndNormalizeText(nextText, lastChild, rng, false);

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
    // Find which context to parse the content in
    const rng = editor.selection.getRng();
    const contextBlock = editor.dom.getParent(rng.commonAncestorContainer, editor.dom.isBlock);
    const contextArgs = contextBlock ? { context: contextBlock.nodeName.toLowerCase() } : { };

    const node = editor.parser.parse(args.content, { isRootContent: true, forced_root_block: false, ...contextArgs, ...args });
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
