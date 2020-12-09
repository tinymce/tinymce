/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';
import { Remove, SelectorFilter, SugarElement } from '@ephox/sugar';
import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as CefUtils from '../dom/CefUtils';
import * as NodeType from '../dom/NodeType';
import * as CefDeleteAction from './CefDeleteAction';
import * as DeleteElement from './DeleteElement';
import * as DeleteUtils from './DeleteUtils';

const deleteElement = (editor: Editor, forward: boolean) => (element: Node) => {
  editor._selectionOverrides.hideFakeCaret();
  DeleteElement.deleteElement(editor, forward, SugarElement.fromDom(element));
  return true;
};

const moveToElement = (editor: Editor, forward: boolean) => (element: Node) => {
  const pos = forward ? CaretPosition.before(element) : CaretPosition.after(element);
  editor.selection.setRng(pos.toRange());
  return true;
};

const moveToPosition = (editor: Editor) => (pos: CaretPosition) => {
  editor.selection.setRng(pos.toRange());
  return true;
};

const getAncestorCe = (editor: Editor, node: Node) => Optional.from(CefUtils.getContentEditableRoot(editor.getBody(), node));

const backspaceDeleteCaret = (editor: Editor, forward: boolean) => {
  const selectedNode = editor.selection.getNode(); // is the parent node if cursor before/after cef

  // Cases:
  // 1. CEF selectedNode -> return true
  // 2. CET selectedNode -> try to delete, return true if possible else false
  // 3. CET ancestor -> try to delete, return true if possible else false
  // 4. no CET/CEF ancestor -> try to delete, return true if possible else false
  // 5. CEF ancestor -> return true

  return getAncestorCe(editor, selectedNode).filter(NodeType.isContentEditableFalse).fold(
    () => CefDeleteAction.read(editor.getBody(), forward, editor.selection.getRng()).exists((deleteAction) =>
      deleteAction.fold(
        deleteElement(editor, forward),
        moveToElement(editor, forward),
        moveToPosition(editor)
      )
    ),
    Fun.always
  );
};

const deleteOffscreenSelection = (rootElement: SugarElement<Node>) => {
  Arr.each(SelectorFilter.descendants(rootElement, '.mce-offscreen-selection'), Remove.remove);
};

const backspaceDeleteRange = (editor: Editor, forward: boolean) => {
  const selectedNode = editor.selection.getNode(); // is the cef node if cef is selected

  // Cases:
  // 1. CEF selectedNode
  //    a. no ancestor CET/CEF || CET ancestor -> run delete code and return true
  //    b. CEF ancestor -> return true
  // 2. non-CEF selectedNode -> return false
  if (NodeType.isContentEditableFalse(selectedNode)) {
    const hasCefAncestor = getAncestorCe(editor, selectedNode.parentNode).filter(NodeType.isContentEditableFalse);
    return hasCefAncestor.fold(
      () => {
        deleteOffscreenSelection(SugarElement.fromDom(editor.getBody()));
        DeleteElement.deleteElement(editor, forward, SugarElement.fromDom(editor.selection.getNode()));
        DeleteUtils.paddEmptyBody(editor);
        return true;
      },
      Fun.always
    );
  }
  return false;
};

const paddEmptyElement = (editor: Editor) => {
  const dom = editor.dom, selection = editor.selection;
  const ceRoot = CefUtils.getContentEditableRoot(editor.getBody(), selection.getNode());

  if (NodeType.isContentEditableTrue(ceRoot) && dom.isBlock(ceRoot) && dom.isEmpty(ceRoot)) {
    const br = dom.create('br', { 'data-mce-bogus': '1' });
    dom.setHTML(ceRoot, '');
    ceRoot.appendChild(br);
    selection.setRng(CaretPosition.before(br).toRange());
  }

  return true;
};

const backspaceDelete = (editor: Editor, forward: boolean) => {
  if (editor.selection.isCollapsed()) {
    return backspaceDeleteCaret(editor, forward);
  } else {
    return backspaceDeleteRange(editor, forward);
  }
};

export {
  backspaceDelete,
  paddEmptyElement
};
