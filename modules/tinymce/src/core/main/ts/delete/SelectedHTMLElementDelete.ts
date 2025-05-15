import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as RangeNormalizer from '../selection/RangeNormalizer';
import * as SelectionUtils from '../selection/SelectionUtils';

import * as DeleteElement from './DeleteElement';

const deleteRange = (editor: Editor, forward: boolean): Optional<() => void> => {
  const rng = RangeNormalizer.normalize(editor.selection.getRng());

  return SelectionUtils.isSelectionOverWholeHTMLElement(rng)
    ? Optional.some(() =>
      DeleteElement.deleteElement(editor, forward, SugarElement.fromDom(editor.selection.getNode()))
    )
    : Optional.none();
};

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? Optional.none() : deleteRange(editor, forward);

export { backspaceDelete };
