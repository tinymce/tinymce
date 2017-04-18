/**
 * CefDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.CefDelete',
  [
    'ephox.sugar.api.node.Element',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.delete.BlockBoundary',
    'tinymce.core.delete.CefDeleteAction',
    'tinymce.core.delete.DeleteElement',
    'tinymce.core.delete.MergeBlocks',
    'tinymce.core.dom.NodeType'
  ],
  function (Element, CaretPosition, CaretUtils, BlockBoundary, CefDeleteAction, DeleteElement, MergeBlocks, NodeType) {
    var deleteElement = function (editor, forward) {
      return function (element) {
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

    var backspaceDeleteRange = function (editor, forward) {
      var selectedElement = editor.selection.getNode();
      if (NodeType.isContentEditableFalse(selectedElement)) {
        DeleteElement.deleteElement(editor, forward, Element.fromDom(editor.selection.getNode()));
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

    return {
      backspaceDelete: backspaceDelete,
      paddEmptyElement: paddEmptyElement
    };
  }
);
