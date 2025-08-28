import { Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import { firstPositionIn, lastPositionIn } from '../caret/CaretFinder';
import { CaretPosition } from '../caret/CaretPosition';
import { isAfterContentEditableFalse, isBeforeContentEditableFalse } from '../caret/CaretPositionPredicates';

const getEdgeCefPosition = (editor: Editor, atStart: boolean): Optional<CaretPosition> => {
  const root = editor.getBody();
  return atStart ? firstPositionIn(root).filter(isBeforeContentEditableFalse) :
    lastPositionIn(root).filter(isAfterContentEditableFalse);
};

const isCefAtEdgeSelected = (editor: Editor): boolean => {
  const rng = editor.selection.getRng();
  return !rng.collapsed
    && (getEdgeCefPosition(editor, true).exists((pos) => pos.isEqual(CaretPosition.fromRangeStart(rng)))
    || getEdgeCefPosition(editor, false).exists((pos) => pos.isEqual(CaretPosition.fromRangeEnd(rng))));
};

export {
  getEdgeCefPosition,
  isCefAtEdgeSelected
};
