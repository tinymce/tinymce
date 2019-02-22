/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';
import Parents from '../dom/Parents';
import { Element } from '@ephox/sugar';
import { CaretPosition } from './CaretPosition';
import CaretFinder from './CaretFinder';
import * as ElementType from '../dom/ElementType';
import { isInSameBlock } from './CaretUtils';
import { Element as DomElement } from '@ephox/dom-globals';
import { isEmptyText } from './CaretPositionPredicates';

const navigateIgnoreEmptyTextNodes = (forward: boolean, root: DomElement, from: CaretPosition) => {
  return CaretFinder.navigateIgnore(forward, root, from, isEmptyText);
};

const isAtBlockBoundary = (forward: boolean, root: Element, pos: CaretPosition) => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(Element.fromDom(pos.container()), root), ElementType.isBlock);
  return Arr.head(parentBlocks).fold(
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

export {
  isAtStartOfBlock,
  isAtEndOfBlock
};
