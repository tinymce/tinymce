/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Remove, Element, SelectorFilter } from '@ephox/sugar';
import CaretPosition from '../caret/CaretPosition';
import * as CefDeleteAction from './CefDeleteAction';
import DeleteElement from './DeleteElement';
import DeleteUtils from './DeleteUtils';
import NodeType from '../dom/NodeType';
import Editor from '../api/Editor';

const deleteElement = function (editor: Editor, forward) {
  return function (element) {
    editor._selectionOverrides.hideFakeCaret();
    DeleteElement.deleteElement(editor, forward, Element.fromDom(element));
    return true;
  };
};

const moveToElement = function (editor: Editor, forward) {
  return function (element) {
    const pos = forward ? CaretPosition.before(element) : CaretPosition.after(element);
    editor.selection.setRng(pos.toRange());
    return true;
  };
};

const moveToPosition = function (editor: Editor) {
  return function (pos) {
    editor.selection.setRng(pos.toRange());
    return true;
  };
};

const backspaceDeleteCaret = function (editor: Editor, forward: boolean) {
  const result = CefDeleteAction.read(editor.getBody(), forward, editor.selection.getRng()).map(function (deleteAction) {
    return deleteAction.fold(
      deleteElement(editor, forward),
      moveToElement(editor, forward),
      moveToPosition(editor)
    );
  });

  return result.getOr(false);
};

const deleteOffscreenSelection = function (rootElement) {
  Arr.each(SelectorFilter.descendants(rootElement, '.mce-offscreen-selection'), Remove.remove);
};

const backspaceDeleteRange = function (editor: Editor, forward: boolean) {
  const selectedElement = editor.selection.getNode();
  if (NodeType.isContentEditableFalse(selectedElement)) {
    deleteOffscreenSelection(Element.fromDom(editor.getBody()));
    DeleteElement.deleteElement(editor, forward, Element.fromDom(editor.selection.getNode()));
    DeleteUtils.paddEmptyBody(editor);
    return true;
  } else {
    return false;
  }
};

const getContentEditableRoot = function (root, node) {
  while (node && node !== root) {
    if (NodeType.isContentEditableTrue(node) || NodeType.isContentEditableFalse(node)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

const paddEmptyElement = function (editor: Editor) {
  let br;
  const ceRoot = getContentEditableRoot(editor.getBody(), editor.selection.getNode());

  if (NodeType.isContentEditableTrue(ceRoot) && editor.dom.isBlock(ceRoot) && editor.dom.isEmpty(ceRoot)) {
    br = editor.dom.create('br', { 'data-mce-bogus': '1' });
    editor.dom.setHTML(ceRoot, '');
    ceRoot.appendChild(br);
    editor.selection.setRng(CaretPosition.before(br).toRange());
  }

  return true;
};

const backspaceDelete = function (editor: Editor, forward) {
  if (editor.selection.isCollapsed()) {
    return backspaceDeleteCaret(editor, forward);
  } else {
    return backspaceDeleteRange(editor, forward);
  }
};

export default {
  backspaceDelete,
  paddEmptyElement
};