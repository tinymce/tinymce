import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as CaretFormat from '../fmt/CaretFormat';
import * as DeleteElement from './DeleteElement';
import * as DeleteUtils from './DeleteUtils';

const getParentInlines = (rootElm: SugarElement<Node>, startElm: SugarElement<Node>): SugarElement<Node>[] => {
  const parents = Parents.parentsAndSelf(startElm, rootElm);
  return Arr.findIndex(parents, ElementType.isBlock).fold(
    Fun.constant(parents),
    (index) => parents.slice(0, index)
  );
};

const hasOnlyOneChild = (elm: SugarElement<Node>): boolean =>
  Traverse.childNodesCount(elm) === 1;

const deleteLastPosition = (forward: boolean, editor: Editor, target: SugarElement<Node>, parentInlines: SugarElement<Node>[]) => {
  const isFormatElement = Fun.curry(CaretFormat.isFormatElement, editor);
  const formatNodes = Arr.map(Arr.filter(parentInlines, isFormatElement), (elm) => elm.dom);

  if (formatNodes.length === 0) {
    DeleteElement.deleteElement(editor, forward, target);
  } else {
    const pos = CaretFormat.replaceWithCaretFormat(target.dom, formatNodes);
    editor.selection.setRng(pos.toRange());
  }
};

const deleteCaret = (editor: Editor, forward: boolean): Optional<() => void> => {
  const rootElm = SugarElement.fromDom(editor.getBody());
  const startElm = SugarElement.fromDom(editor.selection.getStart());
  const parentInlines = Arr.filter(getParentInlines(rootElm, startElm), hasOnlyOneChild);

  return Arr.last(parentInlines).bind((target) => {
    const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());
    if (DeleteUtils.willDeleteLastPositionInElement(forward, fromPos, target.dom) && !CaretFormat.isEmptyCaretFormatElement(target)) {
      return Optional.some(() => deleteLastPosition(forward, editor, target, parentInlines));
    } else {
      return Optional.none();
    }
  });
};

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? deleteCaret(editor, forward) : Optional.none();

export {
  backspaceDelete
};
