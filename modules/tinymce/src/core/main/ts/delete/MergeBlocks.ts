import { Arr, Fun, Optional } from '@ephox/katamari';
import { Compare, Insert, Remove, Replication, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as Empty from '../dom/Empty';
import * as PaddingBr from '../dom/PaddingBr';
import * as Parents from '../dom/Parents';

const getChildrenUntilBlockBoundary = (block: SugarElement<Element>, schema: Schema): SugarElement<Node>[] => {
  const children = Traverse.children(block);
  return Arr.findIndex(children, (el) => schema.isBlock(SugarNode.name(el))).fold(
    Fun.constant(children),
    (index) => children.slice(0, index)
  );
};

const extractChildren = (block: SugarElement<Element>, schema: Schema): SugarElement<Node>[] => {
  const children = getChildrenUntilBlockBoundary(block, schema);
  Arr.each(children, Remove.remove);
  return children;
};

const removeEmptyRoot = (rootNode: SugarElement<Node>, block: SugarElement<Element>) => {
  const parents = Parents.parentsAndSelf(block, rootNode);
  return Arr.find(parents.reverse(), (element) => Empty.isEmpty(element)).each(Remove.remove);
};

const isEmptyBefore = (el: SugarElement<Node>): boolean =>
  Arr.filter(Traverse.prevSiblings(el), (el) => !Empty.isEmpty(el)).length === 0;

const nestedBlockMerge = (
  rootNode: SugarElement<Node>,
  fromBlock: SugarElement<Element>,
  toBlock: SugarElement<Element>,
  schema: Schema,
  insertionPoint: SugarElement<Node>
): Optional<CaretPosition> => {
  if (Empty.isEmpty(toBlock)) {
    PaddingBr.fillWithPaddingBr(toBlock);
    return CaretFinder.firstPositionIn(toBlock.dom);
  }

  if (isEmptyBefore(insertionPoint) && Empty.isEmpty(fromBlock)) {
    Insert.before(insertionPoint, SugarElement.fromTag('br'));
  }

  const position = CaretFinder.prevPosition(toBlock.dom, CaretPosition.before(insertionPoint.dom));
  Arr.each(extractChildren(fromBlock, schema), (child) => {
    Insert.before(insertionPoint, child);
  });
  removeEmptyRoot(rootNode, fromBlock);
  return position;
};

const isInline = (schema: Schema, node: SugarElement<Node>): node is SugarElement<HTMLElement> => schema.isInline(SugarNode.name(node));

const sidelongBlockMerge = (rootNode: SugarElement<Node>, fromBlock: SugarElement<Element>, toBlock: SugarElement<Element>, schema: Schema): Optional<CaretPosition> => {
  if (Empty.isEmpty(toBlock)) {
    if (Empty.isEmpty(fromBlock)) {
      const getInlineToBlockDescendants = (el: SugarElement<Element>) => {
        const helper = (node: SugarElement<Element>, elements: SugarElement<Element>[]): SugarElement<Element>[] =>
          Traverse.firstChild(node).fold(
            () => elements,
            (child) => isInline(schema, child) ? helper(child, elements.concat(Replication.shallow(child))) : elements
          );
        return helper(el, []);
      };

      const newFromBlockDescendants = Arr.foldr(
        getInlineToBlockDescendants(toBlock),
        (element: SugarElement<Element>, descendant) => {
          Insert.wrap(element, descendant);
          return descendant;
        },
        PaddingBr.createPaddingBr()
      );

      Remove.empty(fromBlock);
      Insert.append(fromBlock, newFromBlockDescendants);
    }

    Remove.remove(toBlock);
    return CaretFinder.firstPositionIn(fromBlock.dom);
  }

  const position = CaretFinder.lastPositionIn(toBlock.dom);
  Arr.each(extractChildren(fromBlock, schema), (child) => {
    Insert.append(toBlock, child);
  });
  removeEmptyRoot(rootNode, fromBlock);
  return position;
};

const findInsertionPoint = (toBlock: SugarElement<Element>, block: SugarElement<Element>) => {
  const parentsAndSelf = Parents.parentsAndSelf(block, toBlock);
  return Optional.from(parentsAndSelf[parentsAndSelf.length - 1]);
};

const getInsertionPoint = (fromBlock: SugarElement<Element>, toBlock: SugarElement<Element>): Optional<SugarElement> =>
  Compare.contains(toBlock, fromBlock) ? findInsertionPoint(toBlock, fromBlock) : Optional.none();

const trimBr = (first: boolean, block: SugarElement<Element>) => {
  CaretFinder.positionIn(first, block.dom)
    .bind((position) => Optional.from(position.getNode()))
    .map(SugarElement.fromDom)
    .filter(ElementType.isBr)
    .each(Remove.remove);
};

const mergeBlockInto = (rootNode: SugarElement<Node>, fromBlock: SugarElement<Element>, toBlock: SugarElement<Element>, schema: Schema): Optional<CaretPosition> => {
  trimBr(true, fromBlock);
  trimBr(false, toBlock);

  return getInsertionPoint(fromBlock, toBlock).fold(
    Fun.curry(sidelongBlockMerge, rootNode, fromBlock, toBlock, schema),
    Fun.curry(nestedBlockMerge, rootNode, fromBlock, toBlock, schema)
  );
};

const mergeBlocks = (rootNode: SugarElement<Node>, forward: boolean, block1: SugarElement<Element>, block2: SugarElement<Element>, schema: Schema): Optional<CaretPosition> =>
  forward ? mergeBlockInto(rootNode, block2, block1, schema) : mergeBlockInto(rootNode, block1, block2, schema);

export {
  mergeBlocks
};
