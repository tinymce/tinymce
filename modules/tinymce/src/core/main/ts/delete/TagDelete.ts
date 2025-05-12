import { Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as NodeType from '../dom/NodeType';
import * as RangeNormalizer from '../selection/RangeNormalizer';
import * as SelectionUtils from '../selection/SelectionUtils';

const isSelectionOverWholeHTMLElement = (range: Range): boolean => SelectionUtils.isSelectionOverWholeNode(range, NodeType.isHTMLElement);

const deleteRange = (editor: Editor): Optional<() => void> => {
  const rng = RangeNormalizer.normalize(editor.selection.getRng());

  return isSelectionOverWholeHTMLElement(rng) ? Optional.some(() => rng.deleteContents()) : Optional.none();
};

const backspaceDelete = (editor: Editor): Optional<() => void> =>
  editor.selection.isCollapsed() ? Optional.none() : deleteRange(editor);

export {
  backspaceDelete
};
