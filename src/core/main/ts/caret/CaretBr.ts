/**
 * CaretBr.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Element } from '@ephox/sugar';
import { CaretPosition } from './CaretPosition';
import { getElementFromPosition, getElementFromPrevPosition } from './CaretUtils';
import * as ElementType from '../dom/ElementType';
import { Arr, Fun } from '@ephox/katamari';
import Parents from '../dom/Parents';
import CaretFinder from './CaretFinder';

const isBr = (pos: CaretPosition) => getElementFromPosition(pos).exists(ElementType.isBr);

const findBr = (forward: boolean, root: Element, pos: CaretPosition) => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(Element.fromDom(pos.container()), root), ElementType.isBlock);
  const scope = Arr.head(parentBlocks).getOr(root);
  return CaretFinder.fromPosition(forward, scope.dom(), pos).filter(isBr);
};

const isBeforeBr = (root: Element, pos: CaretPosition) => {
  return getElementFromPosition(pos).exists(ElementType.isBr) || findBr(true, root, pos).isSome();
};

const isAfterBr = (root: Element, pos: CaretPosition) => {
  return getElementFromPrevPosition(pos).exists(ElementType.isBr) || findBr(false, root, pos).isSome();
};

const findPreviousBr = Fun.curry(findBr, false);
const findNextBr = Fun.curry(findBr, true);

export {
  findPreviousBr,
  findNextBr,
  isBeforeBr,
  isAfterBr
};
