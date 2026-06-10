import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import type Editor from '../api/Editor';
import * as RangeNormalizer from '../selection/RangeNormalizer';
import * as SelectionUtils from '../selection/SelectionUtils';

import * as DeleteElement from './DeleteElement';

const deleteRange = (editor: Editor, forward: boolean): Optional<() => void> => {
  const range = editor.selection.getRng();
  const rng = RangeNormalizer.normalize(range);

  return SelectionUtils.isSelectionOverWholeHTMLElement(rng)
    ? Optional.some(() =>
      DeleteElement.deleteElement(editor, forward, SugarElement.fromDom(range.startContainer.childNodes[range.startOffset]))
    )
    : Optional.none();
};

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? Optional.none() : deleteRange(editor, forward);

export { backspaceDelete };
