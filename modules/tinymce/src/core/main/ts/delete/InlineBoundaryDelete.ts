import { Cell, Fun, Optional, Optionals } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import * as BoundaryCaret from '../keyboard/BoundaryCaret';
import * as BoundaryLocation from '../keyboard/BoundaryLocation';
import * as BoundarySelection from '../keyboard/BoundarySelection';
import * as InlineUtils from '../keyboard/InlineUtils';
import * as DeleteElement from './DeleteElement';
import { execNativeDeleteCommand } from './DeleteUtils';

const rangeFromPositions = (from: CaretPosition, to: CaretPosition): Range => {
  const range = document.createRange();

  range.setStart(from.container(), from.offset());
  range.setEnd(to.container(), to.offset());

  return range;
};

// Checks for delete at <code>|a</code> when there is only one item left except the zwsp caret container nodes
const hasOnlyTwoOrLessPositionsLeft = (elm: Node): boolean =>
  Optionals.lift2(
    CaretFinder.firstPositionIn(elm),
    CaretFinder.lastPositionIn(elm),
    (firstPos, lastPos) => {
      const normalizedFirstPos = InlineUtils.normalizePosition(true, firstPos);
      const normalizedLastPos = InlineUtils.normalizePosition(false, lastPos);

      return CaretFinder.nextPosition(elm, normalizedFirstPos).forall((pos) => pos.isEqual(normalizedLastPos));
    }).getOr(true);

const setCaretLocation = (editor: Editor, caret: Cell<Text | null>) => (location: BoundaryLocation.LocationAdt): Optional<() => void> =>
  BoundaryCaret.renderCaret(caret, location).map((pos) =>
    () => BoundarySelection.setCaretPosition(editor, pos)
  );

const deleteFromTo = (editor: Editor, caret: Cell<Text | null>, from: CaretPosition, to: CaretPosition): void => {
  const rootNode = editor.getBody();
  const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);

  editor.undoManager.ignore(() => {
    editor.selection.setRng(rangeFromPositions(from, to));
    // TODO: TINY-9120 - Investigate if this should be using our custom overrides
    execNativeDeleteCommand(editor);

    BoundaryLocation.readLocation(isInlineTarget, rootNode, CaretPosition.fromRangeStart(editor.selection.getRng()))
      .map(BoundaryLocation.inside)
      .bind(setCaretLocation(editor, caret))
      .each(Fun.call);
  });

  editor.nodeChanged();
};

const rescope = (rootNode: Node, node: Node): Node => {
  const parentBlock = CaretUtils.getParentBlock(node, rootNode);
  return parentBlock ? parentBlock : rootNode;
};

const backspaceDeleteCollapsed = (editor: Editor, caret: Cell<Text | null>, forward: boolean, from: CaretPosition): Optional<() => void> => {
  const rootNode = rescope(editor.getBody(), from.container());
  const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
  const fromLocation = BoundaryLocation.readLocation(isInlineTarget, rootNode, from);
  const location = fromLocation.bind((location) => {
    if (forward) {
      return location.fold(
        Fun.constant(Optional.some(BoundaryLocation.inside(location))), // Before
        Optional.none, // Start
        Fun.constant(Optional.some(BoundaryLocation.outside(location))), // End
        Optional.none  // After
      );
    } else {
      return location.fold(
        Optional.none, // Before
        Fun.constant(Optional.some(BoundaryLocation.outside(location))), // Start
        Optional.none, // End
        Fun.constant(Optional.some(BoundaryLocation.inside(location)))  // After
      );
    }
  });

  return location.map(setCaretLocation(editor, caret))
    .getOrThunk((): Optional<() => void> => {
      const toPosition = CaretFinder.navigate(forward, rootNode, from);
      const toLocation = toPosition.bind((pos) => BoundaryLocation.readLocation(isInlineTarget, rootNode, pos));

      return Optionals.lift2(fromLocation, toLocation, () =>
        InlineUtils.findRootInline(isInlineTarget, rootNode, from).bind((elm) => {
          if (hasOnlyTwoOrLessPositionsLeft(elm)) {
            return Optional.some(() => {
              DeleteElement.deleteElement(editor, forward, SugarElement.fromDom(elm));
            });
          } else {
            return Optional.none();
          }
        })
      ).getOrThunk(() => toLocation.bind(() =>
        toPosition.map((to) => {
          return () => {
            if (forward) {
              deleteFromTo(editor, caret, from, to);
            } else {
              deleteFromTo(editor, caret, to, from);
            }
          };
        })
      ));
    });
};

const backspaceDelete = (editor: Editor, caret: Cell<Text | null>, forward: boolean): Optional<() => void> => {
  if (editor.selection.isCollapsed() && Options.isInlineBoundariesEnabled(editor)) {
    const from = CaretPosition.fromRangeStart(editor.selection.getRng());
    return backspaceDeleteCollapsed(editor, caret, forward, from);
  }

  return Optional.none();
};

export {
  backspaceDelete
};
