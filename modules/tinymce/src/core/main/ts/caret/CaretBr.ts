/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element } from '@ephox/sugar';
import { CaretPosition } from './CaretPosition';
import { getElementFromPosition, getElementFromPrevPosition } from './CaretUtils';
import * as ElementType from '../dom/ElementType';
import { Arr, Fun } from '@ephox/katamari';
import * as Parents from '../dom/Parents';
import * as CaretFinder from './CaretFinder';

const isBr = (pos: CaretPosition) => getElementFromPosition(pos).exists(ElementType.isBr);

const findBr = (forward: boolean, root: Element, pos: CaretPosition) => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(Element.fromDom(pos.container()), root), ElementType.isBlock);
  const scope = Arr.head(parentBlocks).getOr(root);
  return CaretFinder.fromPosition(forward, scope.dom(), pos).filter(isBr);
};

const isBeforeBr = (root: Element, pos: CaretPosition) => getElementFromPosition(pos).exists(ElementType.isBr) || findBr(true, root, pos).isSome();

const isAfterBr = (root: Element, pos: CaretPosition) => getElementFromPrevPosition(pos).exists(ElementType.isBr) || findBr(false, root, pos).isSome();

const findPreviousBr = Fun.curry(findBr, false);
const findNextBr = Fun.curry(findBr, true);

export {
  findPreviousBr,
  findNextBr,
  isBeforeBr,
  isAfterBr
};
