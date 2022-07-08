import { Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import { isAfterImageBlock, isBeforeImageBlock } from '../caret/CaretPositionPredicates';
import { getChildNodeAtRelativeOffset } from '../caret/CaretUtils';

const deleteCaret = (editor: Editor, forward: boolean): Optional<() => void> => {
  const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());
  return CaretFinder.fromPosition(forward, editor.getBody(), fromPos)
    .filter((pos) => forward ? isBeforeImageBlock(pos) : isAfterImageBlock(pos))
    .bind((pos) => getChildNodeAtRelativeOffset(forward ? 0 : -1, pos))
    .map((elm) => () => editor.selection.select(elm));
};

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? deleteCaret(editor, forward) : Optional.none();

export {
  backspaceDelete
};
