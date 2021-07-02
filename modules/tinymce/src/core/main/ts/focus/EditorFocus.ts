/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { Compare, Focus, SugarElement, SugarShadowDom } from '@ephox/sugar';

import EditorSelection from '../api/dom/Selection';
import Editor from '../api/Editor';
import Env from '../api/Env';
import * as CaretFinder from '../caret/CaretFinder';
import { CaretPosition } from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as RangeNodes from '../selection/RangeNodes';
import * as SelectionBookmark from '../selection/SelectionBookmark';
import * as FocusController from './FocusController';

const getContentEditableHost = (editor: Editor, node: Node): Element =>
  editor.dom.getParent(node, (node) => editor.dom.getContentEditable(node) === 'true');

const getCollapsedNode = (rng: Range): Optional<SugarElement<Node>> => rng.collapsed ? Optional.from(RangeNodes.getNode(rng.startContainer, rng.startOffset)).map(SugarElement.fromDom) : Optional.none();

const getFocusInElement = (root: SugarElement<any>, rng: Range): Optional<SugarElement<any>> => getCollapsedNode(rng).bind((node) => {
  if (ElementType.isTableSection(node)) {
    return Optional.some(node);
  } else if (Compare.contains(root, node) === false) {
    return Optional.some(root);
  } else {
    return Optional.none();
  }
});

const normalizeSelection = (editor: Editor, rng: Range): void => {
  getFocusInElement(SugarElement.fromDom(editor.getBody()), rng).bind((elm) => {
    return CaretFinder.firstPositionIn(elm.dom);
  }).fold(
    () => {
      editor.selection.normalize(); return;
    },
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

const hasElementFocus = (elm: SugarElement): boolean => Focus.hasFocus(elm) || Focus.search(elm).isSome();

const hasIframeFocus = (editor: Editor): boolean => editor.iframeElement && Focus.hasFocus(SugarElement.fromDom(editor.iframeElement));

const hasInlineFocus = (editor: Editor): boolean => {
  const rawBody = editor.getBody();
  return rawBody && hasElementFocus(SugarElement.fromDom(rawBody));
};

const hasUiFocus = (editor: Editor): boolean => {
  const dos = SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getElement()));
  // Editor container is the obvious one (Menubar, Toolbar, Status bar, Sidebar) and dialogs and menus are in an auxiliary element (silver theme specific)
  // This can't use Focus.search() because only the theme has this element reference
  return Focus.active(dos)
    .filter((elem) => !FocusController.isEditorContentAreaElement(elem.dom) && FocusController.isUIElement(editor, elem.dom))
    .isSome();
};

const hasFocus = (editor: Editor): boolean => editor.inline ? hasInlineFocus(editor) : hasIframeFocus(editor);

const hasEditorOrUiFocus = (editor: Editor): boolean => hasFocus(editor) || hasUiFocus(editor);

const focusEditor = (editor: Editor) => {
  const selection: EditorSelection = editor.selection;
  const body = editor.getBody();
  let rng = selection.getRng();

  editor.quirks.refreshContentEditable();

  if (editor.bookmark !== undefined && hasFocus(editor) === false) {
    SelectionBookmark.getRng(editor).each((bookmarkRng) => {
      editor.selection.setRng(bookmarkRng);
      rng = bookmarkRng;
    });
  }

  // Move focus to contentEditable=true child if needed
  const contentEditableHost = getContentEditableHost(editor, selection.getNode());
  if (editor.$.contains(body, contentEditableHost)) {
    focusBody(contentEditableHost);
    normalizeSelection(editor, rng);
    activateEditor(editor);
    return;
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

  if (skipFocus) {
    activateEditor(editor);
  } else {
    focusEditor(editor);
  }
};

export {
  focus,
  hasFocus,
  hasEditorOrUiFocus
};
