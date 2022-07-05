import { Optional, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import { isAfterMedia, isBeforeMedia } from '../caret/CaretPositionPredicates';
import * as CaretUtils from '../caret/CaretUtils';
import { HDirection } from '../caret/CaretWalker';
import * as NodeType from '../dom/NodeType';
import * as InlineUtils from '../keyboard/InlineUtils';
import * as DeleteElement from './DeleteElement';

const deleteElement = (editor: Editor, forward: boolean, element: Node | undefined): Optional<() => void> => {
  if (Type.isNonNullable(element)) {
    return Optional.some(() => {
      editor._selectionOverrides.hideFakeCaret();
      DeleteElement.deleteElement(editor, forward, SugarElement.fromDom(element));
    });
  } else {
    return Optional.none();
  }
};

const deleteCaret = (editor: Editor, forward: boolean): Optional<() => void> => {
  const isNearMedia = forward ? isBeforeMedia : isAfterMedia;
  const direction = forward ? HDirection.Forwards : HDirection.Backwards;
  const fromPos = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), editor.selection.getRng());

  if (isNearMedia(fromPos)) {
    return deleteElement(editor, forward, fromPos.getNode(!forward));
  } else {
    return Optional.from(InlineUtils.normalizePosition(forward, fromPos))
      .filter((pos) => isNearMedia(pos) && CaretUtils.isMoveInsideSameBlock(fromPos, pos))
      .bind((pos) => deleteElement(editor, forward, pos.getNode(!forward)));
  }
};

const deleteRange = (editor: Editor, forward: boolean): Optional<() => void> => {
  const selectedNode = editor.selection.getNode();
  return NodeType.isMedia(selectedNode) ? deleteElement(editor, forward, selectedNode) : Optional.none();
};

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? deleteCaret(editor, forward) : deleteRange(editor, forward);

export {
  backspaceDelete
};
