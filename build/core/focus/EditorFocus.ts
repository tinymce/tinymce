/**
 * EditorFocus.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option } from '@ephox/katamari';
import { Compare, Focus, Element } from '@ephox/sugar';
import Env from '../api/Env';
import CaretFinder from '../caret/CaretFinder';
import * as ElementType from '../dom/ElementType';
import * as RangeNodes from '../selection/RangeNodes';
import SelectionBookmark from '../selection/SelectionBookmark';
import { Selection } from '../api/dom/Selection';
import { CaretPosition } from '../caret/CaretPosition';

const getContentEditableHost = function (editor, node) {
  return editor.dom.getParent(node, function (node) {
    return editor.dom.getContentEditable(node) === 'true';
  });
};

const getCollapsedNode = function (rng) {
  return rng.collapsed ? Option.from(RangeNodes.getNode(rng.startContainer, rng.startOffset)).map(Element.fromDom) : Option.none();
};

const getFocusInElement = function (root, rng) {
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

const normalizeSelection = (editor, rng: Range): void => {
  getFocusInElement(Element.fromDom(editor.getBody()), rng).bind(function (elm) {
    return CaretFinder.firstPositionIn(elm.dom());
  }).fold(
    () => editor.selection.normalize(),
    (caretPos: CaretPosition) => editor.selection.setRng(caretPos.toRange())
  );
};

const focusBody = function (body) {
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

const hasElementFocus = function (elm) {
  return Focus.hasFocus(elm) || Focus.search(elm).isSome();
};

const hasIframeFocus = function (editor) {
  return editor.iframeElement && Focus.hasFocus(Element.fromDom(editor.iframeElement));
};

const hasInlineFocus = function (editor) {
  const rawBody = editor.getBody();
  return rawBody && hasElementFocus(Element.fromDom(rawBody));
};

const hasFocus = function (editor) {
  return editor.inline ? hasInlineFocus(editor) : hasIframeFocus(editor);
};

const focusEditor = function (editor) {
  const selection: Selection = editor.selection, contentEditable = editor.settings.content_editable;
  const body = editor.getBody();
  let contentEditableHost, rng = selection.getRng();

  editor.quirks.refreshContentEditable();

  // Move focus to contentEditable=true child if needed
  contentEditableHost = getContentEditableHost(editor, selection.getNode());
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
  if (!contentEditable) {
    // WebKit needs this call to fire focusin event properly see #5948
    // But Opera pre Blink engine will produce an empty selection so skip Opera
    if (!Env.opera) {
      focusBody(body);
    }

    editor.getWin().focus();
  }

  // Focus the body as well since it's contentEditable
  if (Env.gecko || contentEditable) {
    focusBody(body);
    normalizeSelection(editor, rng);
  }

  activateEditor(editor);
};

const activateEditor = function (editor) {
  editor.editorManager.setActive(editor);
};

const focus = function (editor, skipFocus) {
  if (editor.removed) {
    return;
  }

  skipFocus ? activateEditor(editor) : focusEditor(editor);
};

export default {
  focus,
  hasFocus
};