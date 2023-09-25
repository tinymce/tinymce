import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as CaretFinder from './CaretFinder';
import { CaretPosition } from './CaretPosition';
import { getElementFromPosition, getElementFromPrevPosition } from './CaretUtils';

const isBr = (pos: CaretPosition): boolean =>
  getElementFromPosition(pos).exists(ElementType.isBr);

const findBr = (forward: boolean, root: SugarElement<Node>, pos: CaretPosition, schema: Schema): Optional<CaretPosition> => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(SugarElement.fromDom(pos.container()), root), (el) => schema.isBlock(SugarNode.name(el)));
  const scope = Arr.head(parentBlocks).getOr(root);
  return CaretFinder.fromPosition(forward, scope.dom, pos).filter(isBr);
};

const isBeforeBr = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean =>
  getElementFromPosition(pos).exists(ElementType.isBr) || findBr(true, root, pos, schema).isSome();

const isAfterBr = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean =>
  getElementFromPrevPosition(pos).exists(ElementType.isBr) || findBr(false, root, pos, schema).isSome();

const findPreviousBr = Fun.curry(findBr, false);
const findNextBr = Fun.curry(findBr, true);

export {
  findPreviousBr,
  findNextBr,
  isBeforeBr,
  isAfterBr
};
