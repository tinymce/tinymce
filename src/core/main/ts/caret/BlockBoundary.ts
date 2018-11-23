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

const isAtBlockBoundary = (forward: boolean, root: Element, pos: CaretPosition) => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(Element.fromDom(pos.container()), root), ElementType.isBlock);
  return Arr.head(parentBlocks).exists((parent) => {
    return CaretFinder.navigate(forward, parent.dom(), pos).isNone();
  });
};

const isAtStartOfBlock = Fun.curry(isAtBlockBoundary, false);
const isAtEndOfBlock = Fun.curry(isAtBlockBoundary, true);

export {
  isAtStartOfBlock,
  isAtEndOfBlock
};
