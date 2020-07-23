/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Settings from '../api/Settings';
import CaretPosition from '../caret/CaretPosition';
import { isAfterContentEditableFalse, isAfterTable, isBeforeContentEditableFalse, isBeforeTable } from '../caret/CaretPositionPredicates';
import * as CaretUtils from '../caret/CaretUtils';
import { CaretWalker, HDirection } from '../caret/CaretWalker';
import * as LineWalker from '../caret/LineWalker';
import * as NodeType from '../dom/NodeType';
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
  const textBlock = editor.dom.create(Settings.getForcedRootBlock(editor));

  if (!Env.ie || Env.ie >= 11) {
    textBlock.innerHTML = '<br data-mce-bogus="1">';
  }

  return textBlock;
};

const exitPreBlock = (editor: Editor, direction: HDirection, range: Range): void => {
  const caretWalker = CaretWalker(editor.getBody());
  const getVisualCaretPosition = Fun.curry(CaretUtils.getVisualCaretPosition, direction === 1 ? caretWalker.next : caretWalker.prev);

  if (range.collapsed && Settings.hasForcedRootBlock(editor)) {
    const pre = editor.dom.getParent(range.startContainer, 'PRE');
    if (!pre) {
      return;
    }

    const caretPos = getVisualCaretPosition(CaretPosition.fromRangeStart(range));
    if (!caretPos) {
      const newBlock = createTextBlock(editor);

      if (direction === 1) {
        editor.$(pre).after(newBlock);
      } else {
        editor.$(pre).before(newBlock);
      }

      editor.selection.select(newBlock, true);
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

const moveH = (editor: Editor, forward: boolean): boolean =>
  getHorizontalRange(editor, forward).exists((newRange) => {
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

export {
  moveH,
  moveV,
  moveToLineEndPoint
};
