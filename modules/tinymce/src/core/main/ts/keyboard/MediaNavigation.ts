import Editor from '../api/Editor';
import { isAfterMedia, isBeforeMedia } from '../caret/CaretPositionPredicates';
import { HDirection } from '../caret/CaretWalker';
import * as NodeType from '../dom/NodeType';
import * as NavigationUtils from './NavigationUtils';

const moveH = (editor: Editor, forward: boolean): boolean => {
  const direction = forward ? HDirection.Forwards : HDirection.Backwards;
  const range = editor.selection.getRng();

  return NavigationUtils.moveHorizontally(editor, direction, range, isBeforeMedia, isAfterMedia, NodeType.isMedia).exists((newRange) => {
    NavigationUtils.moveToRange(editor, newRange);
    return true;
  });
};

const moveV = (editor: Editor, down: boolean): boolean => {
  const direction = down ? 1 : -1;
  const range = editor.selection.getRng();

  return NavigationUtils.moveVertically(editor, direction, range, isBeforeMedia, isAfterMedia, NodeType.isMedia).exists((newRange) => {
    NavigationUtils.moveToRange(editor, newRange);
    return true;
  });
};

const moveToLineEndPoint = (editor: Editor, forward: boolean): boolean => {
  const isNearMedia = forward ? isAfterMedia : isBeforeMedia;
  return NavigationUtils.moveToLineEndPoint(editor, forward, isNearMedia);
};

export {
  moveH,
  moveV,
  moveToLineEndPoint
};
