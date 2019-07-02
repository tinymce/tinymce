/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Range } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Compare, Element, Focus } from '@ephox/sugar';
import Selection from '../api/dom/Selection';
import Editor from '../api/Editor';
import Env from '../api/Env';
import CaretFinder from '../caret/CaretFinder';
import { CaretPosition } from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as RangeNodes from '../selection/RangeNodes';
import SelectionBookmark from '../selection/SelectionBookmark';
import FocusController from './FocusController';

const getContentEditableHost = (editor: Editor, node: Node) => {
  return editor.dom.getParent(node, function (node) {
    return editor.dom.getContentEditable(node) === 'true';
  });
};

const getCollapsedNode = (rng: Range) => {
  return rng.collapsed ? Option.from(RangeNodes.getNode(rng.startContainer, rng.startOffset)).map(Element.fromDom) : Option.none();
};

const getFocusInElement = (root, rng: Range) => {
  return getCollapsedNode(rng).bind(function (node) {
    if (ElementType.isTableSection(node)) {
      return Option.some(node);
    } else if (Compare.contains(root, node) === false) {
      return Option.some(root);
    } else {
      return Option.none();
    }
  });
};

const normalizeSelection = (editor: Editor, rng: Range): void => {
  getFocusInElement(Element.fromDom(editor.getBody()), rng).bind(function (elm) {
    return CaretFinder.firstPositionIn(elm.dom());
  }).fold(
    () => { editor.selection.normalize(); return; },
    (caretPos: CaretPosition) => editor.selection.setRng(caretPos.toRange())
  );
};

const focusBody = (body) => {
  if (body.setActive) {
    // IE 11 sometimes throws "Invalid function" then fallback to focus
    // setActive is better since it doesn't scroll to the element being focused
    try {
      body.setActive();
    } catch (ex) {
      body.focus();
    }
  } else {
    body.focus();
  }
};

const hasElementFocus = (elm): boolean => {
  return Focus.hasFocus(elm) || Focus.search(elm).isSome();
};

const hasIframeFocus = (editor: Editor): boolean => {
  return editor.iframeElement && Focus.hasFocus(Element.fromDom(editor.iframeElement));
};

const hasInlineFocus = (editor: Editor): boolean => {
  const rawBody = editor.getBody();
  return rawBody && hasElementFocus(Element.fromDom(rawBody));
};

const hasUiFocus = (editor: Editor): boolean => {
  // editor container is the obvious one (Toolbar, Status bar, Sidebar)
  return hasElementFocus(Element.fromDom(editor.getContainer())) ||
    // Dialogs and menus are in an auxiliary element (silver theme specific)
    // This can't use Focus.search() because only the theme has this element reference
    Focus.active().filter((elem) => FocusController.isUIElement(editor, elem.dom())).isSome();
};

const hasFocus = (editor: Editor): boolean => editor.inline ? hasInlineFocus(editor) : hasIframeFocus(editor);

const hasEditorOrUiFocus = (editor: Editor): boolean => hasFocus(editor) || hasUiFocus(editor);

const focusEditor = (editor: Editor) => {
  const selection: Selection = editor.selection;
  const body = editor.getBody();
  let rng = selection.getRng();

  editor.quirks.refreshContentEditable();

  // Move focus to contentEditable=true child if needed
  const contentEditableHost = getContentEditableHost(editor, selection.getNode());
  if (editor.$.contains(body, contentEditableHost)) {
    focusBody(contentEditableHost);
    normalizeSelection(editor, rng);
    activateEditor(editor);
    return;
  }

  if (editor.bookmark !== undefined && hasFocus(editor) === false) {
    SelectionBookmark.getRng(editor).each(function (bookmarkRng) {
      editor.selection.setRng(bookmarkRng);
      rng = bookmarkRng;
    });
  }

  // Focus the window iframe
  if (!editor.inline) {
    // WebKit needs this call to fire focusin event properly see #5948
    // But Opera pre Blink engine will produce an empty selection so skip Opera
    if (!Env.opera) {
      focusBody(body);
    }

    editor.getWin().focus();
  }

  // Focus the body as well since it's contentEditable
  if (Env.gecko || editor.inline) {
    focusBody(body);
    normalizeSelection(editor, rng);
  }

  activateEditor(editor);
};

const activateEditor = (editor: Editor) => editor.editorManager.setActive(editor);

const focus = (editor: Editor, skipFocus: boolean) => {
  if (editor.removed) {
    return;
  }

  skipFocus ? activateEditor(editor) : focusEditor(editor);
};

export default {
  focus,
  hasFocus,
  hasEditorOrUiFocus
};