/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional, Optionals } from '@ephox/katamari';
import { Compare, PredicateFind, SugarElement } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import { isListItem, isTextBlock } from '../dom/ElementType';
import * as InlineUtils from '../keyboard/InlineUtils';

const isBeforeRoot = (rootNode: SugarElement<any>) => (elm: SugarElement<any>): boolean =>
  Compare.eq(rootNode, SugarElement.fromDom(elm.dom.parentNode));

const getParentBlock = (rootNode: SugarElement<Node>, elm: SugarElement<Node>): Optional<SugarElement<Node>> =>
  (Compare.contains(rootNode, elm)
    ? PredicateFind.closest(elm, (element) => isTextBlock(element) || isListItem(element), isBeforeRoot(rootNode))
    : Optional.none()
  );

const placeCaretInEmptyBody = (editor: Editor) => {
  const body = editor.getBody();
  const node = body.firstChild && editor.dom.isBlock(body.firstChild) ? body.firstChild : body;
  editor.selection.setCursorLocation(node, 0);
};

const paddEmptyBody = (editor: Editor) => {
  if (editor.dom.isEmpty(editor.getBody())) {
    editor.setContent('');
    placeCaretInEmptyBody(editor);
  }
};

const willDeleteLastPositionInElement = (forward: boolean, fromPos: CaretPosition, elm: Node) =>
  Optionals.lift2(
    CaretFinder.firstPositionIn(elm),
    CaretFinder.lastPositionIn(elm),
    (firstPos, lastPos): boolean => {
      const normalizedFirstPos = InlineUtils.normalizePosition(true, firstPos);
      const normalizedLastPos = InlineUtils.normalizePosition(false, lastPos);
      const normalizedFromPos = InlineUtils.normalizePosition(false, fromPos);

      if (forward) {
        return CaretFinder.nextPosition(elm, normalizedFromPos).exists((nextPos) =>
          nextPos.isEqual(normalizedLastPos) && fromPos.isEqual(normalizedFirstPos)
        );
      } else {
        return CaretFinder.prevPosition(elm, normalizedFromPos).exists((prevPos) =>
          prevPos.isEqual(normalizedFirstPos) && fromPos.isEqual(normalizedLastPos)
        );
      }
    }).getOr(true);

export {
  getParentBlock,
  paddEmptyBody,
  willDeleteLastPositionInElement
};
