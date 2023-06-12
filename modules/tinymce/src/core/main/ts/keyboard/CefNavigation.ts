import { Fun, Optional } from '@ephox/katamari';
import { Insert, SugarElement } from '@ephox/sugar';

import EditorSelection from '../api/dom/Selection';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import CaretPosition from '../caret/CaretPosition';
import { isAfterContentEditableFalse, isAfterTable, isBeforeContentEditableFalse, isBeforeTable } from '../caret/CaretPositionPredicates';
import * as CaretUtils from '../caret/CaretUtils';
import { CaretWalker, HDirection } from '../caret/CaretWalker';
import * as LineWalker from '../caret/LineWalker';
import * as NodeType from '../dom/NodeType';
import { getEdgeCefPosition } from './CefUtils';
import * as InlineUtils from './InlineUtils';
import * as NavigationUtils from './NavigationUtils';

const isContentEditableFalse = NodeType.isContentEditableFalse;

const moveToCeFalseHorizontally = (direction: HDirection, editor: Editor, range: Range): Optional<Range> =>
  NavigationUtils.moveHorizontally(editor, direction, range, isBeforeContentEditableFalse, isAfterContentEditableFalse, isContentEditableFalse);

const moveToCeFalseVertically = (direction: LineWalker.VDirection, editor: Editor, range: Range): Optional<Range> => {
  const isBefore = (caretPosition: CaretPosition) => isBeforeContentEditableFalse(caretPosition) || isBeforeTable(caretPosition);
  const isAfter = (caretPosition: CaretPosition) => isAfterContentEditableFalse(caretPosition) || isAfterTable(caretPosition);
  return NavigationUtils.moveVertically(editor, direction, range, isBefore, isAfter, isContentEditableFalse);
};

const createTextBlock = (editor: Editor): Element => {
  const textBlock = editor.dom.create(Options.getForcedRootBlock(editor));
  textBlock.innerHTML = '<br data-mce-bogus="1">';
  return textBlock;
};

const exitPreBlock = (editor: Editor, direction: HDirection, range: Range): void => {
  const caretWalker = CaretWalker(editor.getBody());
  const getVisualCaretPosition = Fun.curry(CaretUtils.getVisualCaretPosition, direction === 1 ? caretWalker.next : caretWalker.prev);

  if (range.collapsed) {
    const pre = editor.dom.getParent(range.startContainer, 'PRE');
    if (!pre) {
      return;
    }

    const caretPos = getVisualCaretPosition(CaretPosition.fromRangeStart(range));
    if (!caretPos) {
      const newBlock = SugarElement.fromDom(createTextBlock(editor));

      if (direction === 1) {
        Insert.after(SugarElement.fromDom(pre), newBlock);
      } else {
        Insert.before(SugarElement.fromDom(pre), newBlock);
      }

      editor.selection.select(newBlock.dom, true);
      editor.selection.collapse();
    }
  }
};

const getHorizontalRange = (editor: Editor, forward: boolean): Optional<Range> => {
  const direction = forward ? HDirection.Forwards : HDirection.Backwards;
  const range = editor.selection.getRng();

  return moveToCeFalseHorizontally(direction, editor, range).orThunk(() => {
    exitPreBlock(editor, direction, range);
    return Optional.none();
  });
};

const getVerticalRange = (editor: Editor, down: boolean): Optional<Range> => {
  const direction = down ? 1 : -1;
  const range = editor.selection.getRng();

  return moveToCeFalseVertically(direction, editor, range).orThunk(() => {
    exitPreBlock(editor, direction, range);
    return Optional.none();
  });
};

const flipDirection = (selection: EditorSelection, forward: boolean) => {
  const elm = forward ? selection.getEnd(true) : selection.getStart(true);
  return InlineUtils.isRtl(elm) ? !forward : forward;
};

const moveH = (editor: Editor, forward: boolean): boolean =>
  getHorizontalRange(editor, flipDirection(editor.selection, forward)).exists((newRange) => {
    NavigationUtils.moveToRange(editor, newRange);
    return true;
  });

const moveV = (editor: Editor, down: boolean): boolean =>
  getVerticalRange(editor, down).exists((newRange) => {
    NavigationUtils.moveToRange(editor, newRange);
    return true;
  });

const moveToLineEndPoint = (editor: Editor, forward: boolean): boolean => {
  const isCefPosition = forward ? isAfterContentEditableFalse : isBeforeContentEditableFalse;
  return NavigationUtils.moveToLineEndPoint(editor, forward, isCefPosition);
};

const selectToEndPoint = (editor: Editor, forward: boolean): boolean =>
  getEdgeCefPosition(editor, !forward)
    .map((pos) => {
      const rng = pos.toRange();
      const curRng = editor.selection.getRng();
      if (forward) {
        rng.setStart(curRng.startContainer, curRng.startOffset);
      } else {
        rng.setEnd(curRng.endContainer, curRng.endOffset);
      }
      return rng;
    })
    .exists((rng) => {
      NavigationUtils.moveToRange(editor, rng);
      return true;
    });

export {
  moveH,
  moveV,
  moveToLineEndPoint,
  selectToEndPoint
};
