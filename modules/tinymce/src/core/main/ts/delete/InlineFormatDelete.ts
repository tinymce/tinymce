import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as CaretFormat from '../fmt/CaretFormat';
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

const deleteLastPosition = (forward: boolean, editor: Editor, target: SugarElement<Node>, parentInlines: SugarElement<Node>[]) => {
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

const deleteRange = (editor: Editor): Optional<() => void> => {
  if (editor.selection.getRng().startOffset === 0) {
    const parentInlines = getParentInlines(editor);
    const formatNodes = getFormatNodes(editor, parentInlines);

    if (formatNodes.length === 0) {
      return Optional.none();
    } else {
      return Optional.some(() => {
        DeleteUtils.execNativeDeleteCommand(editor);
        CaretFormat.updateCaretFormat(editor, formatNodes);
      });
    }
  } else {
    return Optional.none();
  }
};

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? deleteCaret(editor, forward) : deleteRange(editor);

export {
  backspaceDelete
};
