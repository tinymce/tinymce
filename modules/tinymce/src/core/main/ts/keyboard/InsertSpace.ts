import { Fun, Optional, Optionals } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import Env from '../api/Env';
import Schema from '../api/html/Schema';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import { insertNbspAtPosition, insertSpaceAtPosition } from '../caret/InsertText';
import * as BoundaryLocation from './BoundaryLocation';
import * as InlineUtils from './InlineUtils';
import { needsToHaveNbsp } from './Nbsps';

const insertSpaceOrNbspAtPosition = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): Optional<CaretPosition> =>
  needsToHaveNbsp(root, pos, schema) ? insertNbspAtPosition(pos) : insertSpaceAtPosition(pos);

const locationToCaretPosition = (root: SugarElement<Node>) => (location: BoundaryLocation.LocationAdt) => location.fold(
  (element) => CaretFinder.prevPosition(root.dom, CaretPosition.before(element)),
  (element) => CaretFinder.firstPositionIn(element),
  (element) => CaretFinder.lastPositionIn(element),
  (element) => CaretFinder.nextPosition(root.dom, CaretPosition.after(element))
);

const insertInlineBoundarySpaceOrNbsp = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema) => (checkPos: CaretPosition) =>
  needsToHaveNbsp(root, checkPos, schema) ? insertNbspAtPosition(pos) : insertSpaceAtPosition(pos);

const setSelection = (editor: Editor) => (pos: CaretPosition) => {
  editor.selection.setRng(pos.toRange());
  editor.nodeChanged();
};

const isInsideSummary = (domUtils: DOMUtils, node: Node) => domUtils.isEditable(domUtils.getParent(node, 'summary'));

const insertSpaceOrNbspAtSelection = (editor: Editor): Optional<() => void> => {
  const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
  const root = SugarElement.fromDom(editor.getBody());

  if (editor.selection.isCollapsed()) {
    const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
    const caretPosition = CaretPosition.fromRangeStart(editor.selection.getRng());

    return BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), caretPosition)
      .bind(locationToCaretPosition(root))
      .map((checkPos) => () =>
        insertInlineBoundarySpaceOrNbsp(root, pos, editor.schema)(checkPos).each(setSelection(editor)));
  } else {
    return Optional.none();
  }
};

// TINY-9964: Firefox has a bug where the space key is toggling the open state instead of inserting a space in a summary element
const insertSpaceInSummaryAtSelectionOnFirefox = (editor: Editor): Optional<() => void> => {
  const insertSpaceThunk = () => {
    const root = SugarElement.fromDom(editor.getBody());

    if (!editor.selection.isCollapsed()) {
      editor.getDoc().execCommand('Delete');
    }

    const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
    insertSpaceOrNbspAtPosition(root, pos, editor.schema).each(setSelection(editor));
  };

  return Optionals.someIf(Env.browser.isFirefox() && editor.selection.isEditable() && isInsideSummary(editor.dom, editor.selection.getRng().startContainer), insertSpaceThunk);
};

export {
  insertSpaceOrNbspAtPosition,
  insertSpaceOrNbspAtSelection,
  insertSpaceInSummaryAtSelectionOnFirefox
};
