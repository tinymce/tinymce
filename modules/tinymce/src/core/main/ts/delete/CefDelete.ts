import { Arr, Fun, Optional } from '@ephox/katamari';
import { Remove, SelectorFilter, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as CefUtils from '../dom/CefUtils';
import * as NodeType from '../dom/NodeType';
import { isCefAtEdgeSelected } from '../keyboard/CefUtils';
import * as CefDeleteAction from './CefDeleteAction';
import * as DeleteElement from './DeleteElement';
import * as DeleteUtils from './DeleteUtils';

const deleteElement = (editor: Editor, forward: boolean) => (element: Node): boolean => {
  editor._selectionOverrides.hideFakeCaret();
  DeleteElement.deleteElement(editor, forward, SugarElement.fromDom(element));
  return true;
};

const moveToElement = (editor: Editor, forward: boolean) => (element: Node): boolean => {
  const pos = forward ? CaretPosition.before(element) : CaretPosition.after(element);
  editor.selection.setRng(pos.toRange());
  return true;
};

const moveToPosition = (editor: Editor) => (pos: CaretPosition): boolean => {
  editor.selection.setRng(pos.toRange());
  return true;
};

const getAncestorCe = (editor: Editor, node: Node | null): Optional<Node> =>
  Optional.from(CefUtils.getContentEditableRoot(editor.getBody(), node));

const backspaceDeleteCaret = (editor: Editor, forward: boolean): Optional<() => void> => {
  const selectedNode = editor.selection.getNode(); // is the parent node if cursor before/after cef

  // Cases:
  // 1. CEF selectedNode -> return true
  // 2. CET selectedNode -> try to delete, return true if possible else false
  // 3. CET ancestor -> try to delete, return true if possible else false
  // 4. no CET/CEF ancestor -> try to delete, return true if possible else false
  // 5. CEF ancestor -> return true

  return getAncestorCe(editor, selectedNode).filter(NodeType.isContentEditableFalse).fold(
    () => CefDeleteAction.read(editor.getBody(), forward, editor.selection.getRng(), editor.schema).map((deleteAction) =>
      () =>
        deleteAction.fold(
          deleteElement(editor, forward),
          moveToElement(editor, forward),
          moveToPosition(editor)
        )
    ),
    () => Optional.some(Fun.noop)
  );
};

const deleteOffscreenSelection = (rootElement: SugarElement<Node>): void => {
  Arr.each(SelectorFilter.descendants(rootElement, '.mce-offscreen-selection'), Remove.remove);
};

const backspaceDeleteRange = (editor: Editor, forward: boolean): Optional<() => void> => {
  const selectedNode = editor.selection.getNode(); // is the cef node if cef is selected

  // Cases:
  // 1. Table cell -> return false, as this is handled by `TableDelete` instead
  // 2. CEF selectedNode
  //    a. no ancestor CET/CEF || CET ancestor -> run delete code and return true
  //    b. CEF ancestor -> return true
  // 3. non-CEF selectedNode -> return false
  if (NodeType.isContentEditableFalse(selectedNode) && !NodeType.isTableCell(selectedNode)) {
    const hasCefAncestor = getAncestorCe(editor, selectedNode.parentNode).filter(NodeType.isContentEditableFalse);
    return hasCefAncestor.fold(
      () =>
        Optional.some(() => {
          deleteOffscreenSelection(SugarElement.fromDom(editor.getBody()));
          DeleteElement.deleteElement(editor, forward, SugarElement.fromDom(editor.selection.getNode()));
          DeleteUtils.paddEmptyBody(editor);
        }),
      () => Optional.some(Fun.noop)
    );
  }

  if (isCefAtEdgeSelected(editor)) {
    return Optional.some(() => {
      DeleteUtils.deleteRangeContents(editor, editor.selection.getRng(), SugarElement.fromDom(editor.getBody()));
    });
  }
  return Optional.none();
};

const paddEmptyElement = (editor: Editor): boolean => {
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

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> => {
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
