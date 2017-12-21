/**
 * CefDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import CaretPosition from '../caret/CaretPosition';
import CefDeleteAction from './CefDeleteAction';
import DeleteElement from './DeleteElement';
import DeleteUtils from './DeleteUtils';
import NodeType from '../dom/NodeType';

var deleteElement = function (editor, forward) {
  return function (element) {
    editor._selectionOverrides.hideFakeCaret();
    DeleteElement.deleteElement(editor, forward, Element.fromDom(element));
    return true;
  };
};

var moveToElement = function (editor, forward) {
  return function (element) {
    var pos = forward ? CaretPosition.before(element) : CaretPosition.after(element);
    editor.selection.setRng(pos.toRange());
    return true;
  };
};

var moveToPosition = function (editor) {
  return function (pos) {
    editor.selection.setRng(pos.toRange());
    return true;
  };
};

var backspaceDeleteCaret = function (editor, forward) {
  var result = CefDeleteAction.read(editor.getBody(), forward, editor.selection.getRng()).map(function (deleteAction) {
    return deleteAction.fold(
      deleteElement(editor, forward),
      moveToElement(editor, forward),
      moveToPosition(editor)
    );
  });

  return result.getOr(false);
};

var deleteOffscreenSelection = function (rootElement) {
  Arr.each(SelectorFilter.descendants(rootElement, '.mce-offscreen-selection'), Remove.remove);
};

var backspaceDeleteRange = function (editor, forward) {
  var selectedElement = editor.selection.getNode();
  if (NodeType.isContentEditableFalse(selectedElement)) {
    deleteOffscreenSelection(Element.fromDom(editor.getBody()));
    DeleteElement.deleteElement(editor, forward, Element.fromDom(editor.selection.getNode()));
    DeleteUtils.paddEmptyBody(editor);
    return true;
  } else {
    return false;
  }
};

var getContentEditableRoot = function (root, node) {
  while (node && node !== root) {
    if (NodeType.isContentEditableTrue(node) || NodeType.isContentEditableFalse(node)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

var paddEmptyElement = function (editor) {
  var br, ceRoot = getContentEditableRoot(editor.getBody(), editor.selection.getNode());

  if (NodeType.isContentEditableTrue(ceRoot) && editor.dom.isBlock(ceRoot) && editor.dom.isEmpty(ceRoot)) {
    br = editor.dom.create('br', { "data-mce-bogus": "1" });
    editor.dom.setHTML(ceRoot, '');
    ceRoot.appendChild(br);
    editor.selection.setRng(CaretPosition.before(br).toRange());
  }

  return true;
};

var backspaceDelete = function (editor, forward) {
  if (editor.selection.isCollapsed()) {
    return backspaceDeleteCaret(editor, forward);
  } else {
    return backspaceDeleteRange(editor, forward);
  }
};

export default <any> {
  backspaceDelete: backspaceDelete,
  paddEmptyElement: paddEmptyElement
};