/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';
import Parents from '../dom/Parents';
import { Element, Compare } from '@ephox/sugar';
import { CaretPosition } from './CaretPosition';
import CaretFinder from './CaretFinder';
import * as ElementType from '../dom/ElementType';
import { isInSameBlock } from './CaretUtils';
import { Element as DomElement } from '@ephox/dom-globals';
import { isEmptyText } from './CaretPositionPredicates';

const navigateIgnoreEmptyTextNodes = (forward: boolean, root: DomElement, from: CaretPosition) => {
  return CaretFinder.navigateIgnore(forward, root, from, isEmptyText);
};

const getClosestBlock = (root: Element, pos: CaretPosition) => {
  return Arr.find(Parents.parentsAndSelf(Element.fromDom(pos.container()), root), ElementType.isBlock);
};

const isAtBeforeAfterBlockBoundary = (forward: boolean, root: Element, pos: CaretPosition) => {
  return navigateIgnoreEmptyTextNodes(forward, root.dom(), pos).forall((newPos) => {
    return getClosestBlock(root, pos).fold(
      () => {
        return isInSameBlock(newPos, pos, root.dom()) === false;
      },
      (fromBlock) => {
        return isInSameBlock(newPos, pos, root.dom()) === false && Compare.contains(fromBlock, Element.fromDom(newPos.container()));
      }
    );
  });
};

const isAtBlockBoundary = (forward: boolean, root: Element, pos: CaretPosition) => {
  return getClosestBlock(root, pos).fold(
    () => {
      return navigateIgnoreEmptyTextNodes(forward, root.dom(), pos).forall((newPos) => {
        return isInSameBlock(newPos, pos, root.dom()) === false;
      });
    },
    (parent) => {
      return navigateIgnoreEmptyTextNodes(forward, parent.dom(), pos).isNone();
    }
  );
};

const isAtStartOfBlock = Fun.curry(isAtBlockBoundary, false);
const isAtEndOfBlock = Fun.curry(isAtBlockBoundary, true);
const isBeforeBlock = Fun.curry(isAtBeforeAfterBlockBoundary, false);
const isAfterBlock = Fun.curry(isAtBeforeAfterBlockBoundary, true);

export {
  isAtStartOfBlock,
  isAtEndOfBlock,
  isBeforeBlock,
  isAfterBlock
};
