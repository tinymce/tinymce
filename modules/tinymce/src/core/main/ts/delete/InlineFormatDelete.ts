import { Arr, Fun, Optional, Type } from '@ephox/katamari';
import { PredicateFilter, SugarElement, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as Empty from '../dom/Empty';
import * as NodeType from '../dom/NodeType';
import * as Parents from '../dom/Parents';
import * as CaretFormat from '../fmt/CaretFormat';
import { isCaretNode } from '../fmt/FormatContainer';
import * as DeleteElement from './DeleteElement';
import * as DeleteUtils from './DeleteUtils';

const hasOnlyOneChild = (elm: SugarElement<Node>): boolean =>
  Traverse.childNodesCount(elm) === 1;

const getParentInlines = (editor: Editor): SugarElement<Node>[] => {
  const rootElm = SugarElement.fromDom(editor.getBody());
  const startElm = SugarElement.fromDom(editor.selection.getStart());
  const parents = Parents.parentsAndSelf(startElm, rootElm);
  return Arr.findIndex(parents, ElementType.isBlock).fold(
    Fun.constant(parents),
    (index) => parents.slice(0, index)
  ).filter(hasOnlyOneChild);
};

const getFormatNodes = (editor: Editor, parentInlines: SugarElement<Node>[]): Node[] => {
  const isFormatElement = Fun.curry(CaretFormat.isFormatElement, editor);
  return Arr.map(Arr.filter(parentInlines, isFormatElement), (elm) => elm.dom);
};

const getFormatNodesAtStart = (editor: Editor) => {
  const parentInlines = getParentInlines(editor);
  return getFormatNodes(editor, parentInlines);
};

const deleteLastPosition = (forward: boolean, editor: Editor, target: SugarElement<Node>, parentInlines: SugarElement<Node>[]): void => {
  const formatNodes = getFormatNodes(editor, parentInlines);

  if (formatNodes.length === 0) {
    DeleteElement.deleteElement(editor, forward, target);
  } else {
    const pos = CaretFormat.replaceWithCaretFormat(target.dom, formatNodes);
    editor.selection.setRng(pos.toRange());
  }
};

const deleteCaret = (editor: Editor, forward: boolean): Optional<() => void> => {
  const parentInlines = getParentInlines(editor);
  return Arr.last(parentInlines).bind((target) => {
    const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());
    if (DeleteUtils.willDeleteLastPositionInElement(forward, fromPos, target.dom) && !CaretFormat.isEmptyCaretFormatElement(target)) {
      return Optional.some(() => deleteLastPosition(forward, editor, target, parentInlines));
    } else {
      return Optional.none();
    }
  });
};

const isBrInEmptyElement = (elm: Element): boolean => {
  const parentElm = elm.parentElement;
  return !Type.isNull(parentElm) && Empty.isEmpty(SugarElement.fromDom(parentElm)) && NodeType.isBr(elm);
};

const isEmptyCaret = (elm: Element): boolean => {
  return CaretFormat.isEmptyCaretFormatElement(SugarElement.fromDom(elm));
};

const createCaretFormatAtStart = (editor: Editor, formatNodes: Node[]): void => {
  const startElm = editor.selection.getStart();
  // replace <br> in empty node or existing caret at start if applicable
  // otherwise create new caret format at start
  const pos = isBrInEmptyElement(startElm) || isEmptyCaret(startElm)
    ? CaretFormat.replaceWithCaretFormat(startElm, formatNodes)
    : CaretFormat.createCaretFormatAtStart(editor, formatNodes);
  editor.selection.setRng(pos.toRange());
};

const updateCaretFormat = (editor: Editor, updateFormats: Node[]): void => {
  const missingFormats = Arr.difference(updateFormats, getFormatNodesAtStart(editor));
  if (missingFormats.length > 0) {
    createCaretFormatAtStart(editor, missingFormats);
  }
};

const deleteRange = (editor: Editor): Optional<() => void> => {
  const selRng = editor.selection.getRng();
  if (selRng.startOffset === 0) {
    const formatNodes = getFormatNodesAtStart(editor);
    return Optional.some(() => {
      DeleteUtils.execNativeDeleteCommand(editor);
      updateCaretFormat(editor, formatNodes);
    });
  } else {
    return Optional.none();
  }
};

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? deleteCaret(editor, forward) : deleteRange(editor);

const hasAncestorInlineCaret = (elm: SugarElement<Node>): boolean =>
  PredicateFilter.ancestors(elm, (node) => isCaretNode(node.dom), (node) => ElementType.isBlock(node)).length > 0;

const refreshCaretFormat = (editor: Editor): boolean => {
  if (editor.selection.getRng().startOffset === 0 && !hasAncestorInlineCaret(SugarElement.fromDom(editor.selection.getStart()))) {
    createCaretFormatAtStart(editor, []);
  }
  return true;
};

export {
  backspaceDelete,
  refreshCaretFormat
};
