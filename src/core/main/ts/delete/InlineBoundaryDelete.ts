/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document } from '@ephox/dom-globals';
import { Fun, Option, Options } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import DeleteElement from './DeleteElement';
import BoundaryCaret from '../keyboard/BoundaryCaret';
import BoundaryLocation from '../keyboard/BoundaryLocation';
import BoundarySelection from '../keyboard/BoundarySelection';
import InlineUtils from '../keyboard/InlineUtils';
import Editor from '../api/Editor';

const isFeatureEnabled = function (editor: Editor) {
  return editor.settings.inline_boundaries !== false;
};

const rangeFromPositions = function (from, to) {
  const range = document.createRange();

  range.setStart(from.container(), from.offset());
  range.setEnd(to.container(), to.offset());

  return range;
};

// Checks for delete at <code>|a</code> when there is only one item left except the zwsp caret container nodes
const hasOnlyTwoOrLessPositionsLeft = function (elm) {
  return Options.liftN([
    CaretFinder.firstPositionIn(elm),
    CaretFinder.lastPositionIn(elm)
  ], function (firstPos, lastPos) {
    const normalizedFirstPos = InlineUtils.normalizePosition(true, firstPos);
    const normalizedLastPos = InlineUtils.normalizePosition(false, lastPos);

    return CaretFinder.nextPosition(elm, normalizedFirstPos).map(function (pos) {
      return pos.isEqual(normalizedLastPos);
    }).getOr(true);
  }).getOr(true);
};

const setCaretLocation = function (editor: Editor, caret) {
  return function (location) {
    return BoundaryCaret.renderCaret(caret, location).map(function (pos) {
      BoundarySelection.setCaretPosition(editor, pos);
      return true;
    }).getOr(false);
  };
};

const deleteFromTo = function (editor: Editor, caret, from, to) {
  const rootNode = editor.getBody();
  const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);

  editor.undoManager.ignore(function () {
    editor.selection.setRng(rangeFromPositions(from, to));
    editor.execCommand('Delete');

    BoundaryLocation.readLocation(isInlineTarget, rootNode, CaretPosition.fromRangeStart(editor.selection.getRng()))
      .map(BoundaryLocation.inside)
      .map(setCaretLocation(editor, caret));
  });

  editor.nodeChanged();
};

const rescope = function (rootNode, node) {
  const parentBlock = CaretUtils.getParentBlock(node, rootNode);
  return parentBlock ? parentBlock : rootNode;
};

const backspaceDeleteCollapsed = function (editor: Editor, caret, forward: boolean, from) {
  const rootNode = rescope(editor.getBody(), from.container());
  const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
  const fromLocation = BoundaryLocation.readLocation(isInlineTarget, rootNode, from);

  return fromLocation.bind(function (location) {
    if (forward) {
      return location.fold(
        Fun.constant(Option.some(BoundaryLocation.inside(location))), // Before
        Option.none, // Start
        Fun.constant(Option.some(BoundaryLocation.outside(location))), // End
        Option.none  // After
      );
    } else {
      return location.fold(
        Option.none, // Before
        Fun.constant(Option.some(BoundaryLocation.outside(location))), // Start
        Option.none, // End
        Fun.constant(Option.some(BoundaryLocation.inside(location)))  // After
      );
    }
  })
  .map(setCaretLocation(editor, caret))
  .getOrThunk(function () {
    const toPosition = CaretFinder.navigate(forward, rootNode, from);
    const toLocation = toPosition.bind(function (pos) {
      return BoundaryLocation.readLocation(isInlineTarget, rootNode, pos);
    });

    if (fromLocation.isSome() && toLocation.isSome()) {
      return InlineUtils.findRootInline(isInlineTarget, rootNode, from).map(function (elm) {
        if (hasOnlyTwoOrLessPositionsLeft(elm)) {
          DeleteElement.deleteElement(editor, forward, Element.fromDom(elm));
          return true;
        } else {
          return false;
        }
      }).getOr(false);
    } else {
      return toLocation.bind(function (_) {
        return toPosition.map(function (to) {
          if (forward) {
            deleteFromTo(editor, caret, from, to);
          } else {
            deleteFromTo(editor, caret, to, from);
          }

          return true;
        });
      }).getOr(false);
    }
  });
};

const backspaceDelete = function (editor: Editor, caret, forward?: boolean) {
  if (editor.selection.isCollapsed() && isFeatureEnabled(editor)) {
    const from = CaretPosition.fromRangeStart(editor.selection.getRng());
    return backspaceDeleteCollapsed(editor, caret, forward, from);
  }

  return false;
};

export default {
  backspaceDelete
};