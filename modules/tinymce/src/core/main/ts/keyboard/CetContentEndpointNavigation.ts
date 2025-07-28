import { Fun, Optional, Optionals } from '@ephox/katamari';
import { Compare, PredicateFind, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as LineReader from '../caret/LineReader';
import * as NodeType from '../dom/NodeType';

import * as NavigationUtils from './NavigationUtils';

const getClosestCetBlock = (position: CaretPosition, root: SugarElement<HTMLElement>): Optional<SugarElement<HTMLElement>> => {
  const isRoot = (el: SugarElement<Node>): boolean => Compare.eq(el, root);
  const isCet = (el: SugarElement<Node>): el is SugarElement<HTMLElement> => NodeType.isContentEditableTrue(el.dom);
  const startNode = SugarElement.fromDom(position.container());

  const closestCetBlock = PredicateFind.closest<HTMLElement>(startNode, isCet, isRoot);
  return closestCetBlock.filter((b) => !isRoot(b));
};

const moveVertically = (editor: Editor, position: CaretPosition, down: boolean): Optional<Range> => {
  const getNextPosition = down ? LineReader.getClosestPositionBelow : LineReader.getClosestPositionAbove;
  return getNextPosition(editor.getBody(), position).map((nextPosition) => nextPosition.toRange());
};

const moveToNextOrPreviousLine = (editor: Editor, down: boolean): boolean => {
  const startPosition = CaretPosition.fromRangeStart(editor.selection.getRng());
  const endPosition = CaretPosition.fromRangeEnd(editor.selection.getRng());
  const root = SugarElement.fromDom(editor.getBody());

  /* I wasn't able to find a way to create a selection between two different contenteditable elements.
    However I can't rule out that it is possible. So I am checking if both positions are in the same contenteditable element.
    This is a defensive check to ensure selection integrity.
  */
  const closestCetBlock = Optionals.flatten(Optionals.lift2(
    getClosestCetBlock(startPosition, root),
    getClosestCetBlock(endPosition, root),
    (c1, c2) => Compare.eq(c1, c2) ? Optional.some(c1) : Optional.none()
  ));

  return closestCetBlock.fold(
    Fun.never,
    (cetBlock) => {
      if (
        (down && LineReader.isAtLastLine(cetBlock.dom, endPosition)) ||
        (!down && LineReader.isAtFirstLine(cetBlock.dom, startPosition))
      ) {
        return moveVertically(editor, down ? endPosition : startPosition, down).exists((newRange) => {
          NavigationUtils.moveToRange(editor, newRange);
          return true;
        });
      }
      return false;
    }
  );
};

const moveV = (editor: Editor, down: boolean): boolean =>
  moveToNextOrPreviousLine(editor, down);

export {
  moveV
};