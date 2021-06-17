/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as CaretFinder from './CaretFinder';
import { CaretPosition } from './CaretPosition';
import { getElementFromPosition, getElementFromPrevPosition } from './CaretUtils';

const isBr = (pos: CaretPosition): boolean =>
  getElementFromPosition(pos).exists(ElementType.isBr);

const findBr = (forward: boolean, root: SugarElement, pos: CaretPosition): Optional<CaretPosition> => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(SugarElement.fromDom(pos.container()), root), ElementType.isBlock);
  const scope = Arr.head(parentBlocks).getOr(root);
  return CaretFinder.fromPosition(forward, scope.dom, pos).filter(isBr);
};

const isBeforeBr = (root: SugarElement, pos: CaretPosition): boolean =>
  getElementFromPosition(pos).exists(ElementType.isBr) || findBr(true, root, pos).isSome();

const isAfterBr = (root: SugarElement, pos: CaretPosition): boolean =>
  getElementFromPrevPosition(pos).exists(ElementType.isBr) || findBr(false, root, pos).isSome();

const findPreviousBr = Fun.curry(findBr, false);
const findNextBr = Fun.curry(findBr, true);

export {
  findPreviousBr,
  findNextBr,
  isBeforeBr,
  isAfterBr
};
