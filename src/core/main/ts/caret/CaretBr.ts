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
import { getElementFromPosition } from './CaretUtils';
import * as ElementType from '../dom/ElementType';
import { Arr } from '@ephox/katamari';
import Parents from '../dom/Parents';
import CaretFinder from './CaretFinder';

const isBeforeBr = (pos: CaretPosition) => getElementFromPosition(pos).exists(ElementType.isBr);

const isAtBr = (root: Element, pos: CaretPosition) => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(Element.fromDom(pos.container()), root), ElementType.isBlock);
  const scope = Arr.head(parentBlocks).getOr(root);
  return isBeforeBr(pos) || CaretFinder.isAdjacentTo(scope, pos, (_, pos) => isBeforeBr(pos));
};

export {
  isBeforeBr,
  isAtBr
};
