import { Fun, Option } from '@ephox/katamari';
import { Spot, SpotPoint } from '@ephox/phoenix';
import { Awareness, ElementAddress, Node, Situ, Text, Traverse, Element } from '@ephox/sugar';
import { BeforeAfter } from './BeforeAfter';
import { KeyDirection } from './KeyDirection';

const isBr = function (elem: Element) {
  return Node.name(elem) === 'br';
};

const gatherer = function (cand: Element, gather: KeyDirection['gather'], isRoot: (e: Element) => boolean): Option<Element> {
  return gather(cand, isRoot).bind(function (target) {
    return Node.isText(target) && Text.get(target).trim().length === 0 ? gatherer(target, gather, isRoot) : Option.some(target);
  });
};

const handleBr = function (isRoot: (e: Element) => boolean, element: Element, direction: KeyDirection) {
  // 1. Has a neighbouring sibling ... position relative to neighbouring element
  // 2. Has no neighbouring sibling ... position relative to gathered element
  return direction.traverse(element).orThunk(function () {
    return gatherer(element, direction.gather, isRoot);
  }).map(direction.relative);
};

const findBr = function (element: Element, offset: number) {
  return Traverse.child(element, offset).filter(isBr).orThunk(function () {
    // Can be either side of the br, and still be a br.
    return Traverse.child(element, offset - 1).filter(isBr);
  });
};

const handleParent = function (isRoot: (e: Element) => boolean, element: Element, offset: number, direction: KeyDirection) {
  // 1. Has no neighbouring sibling, position relative to gathered element
  // 2. Has a neighbouring sibling, position at the neighbouring sibling with respect to parent
  return findBr(element, offset).bind(function (br) {
    return direction.traverse(br).fold(function () {
      return gatherer(br, direction.gather, isRoot).map(direction.relative);
    }, function (adjacent) {
      return ElementAddress.indexInParent(adjacent).map(function (info) {
        return Situ.on(info.parent(), info.index());
      });
    });
  });
};

const tryBr = function (isRoot: (e: Element) => boolean, element: Element, offset: number, direction: KeyDirection) {
  // Three different situations
  // 1. the br is the child, and it has a previous sibling. Use parent, index-1)
  // 2. the br is the child and it has no previous sibling, set to before the previous gather result
  // 3. the br is the element and it has a previous sibling, use parent index-1)
  // 4. the br is the element and it has no previous sibling, set to before the previous gather result.
  // 2. the element is the br itself,
  const target = isBr(element) ? handleBr(isRoot, element, direction) : handleParent(isRoot, element, offset, direction);
  return target.map(function (tgt) {
    return {
      start: Fun.constant(tgt),
      finish: Fun.constant(tgt)
    };
  });
};

const process = function (analysis: BeforeAfter): Option<SpotPoint<Element>> {
  return BeforeAfter.cata(analysis,
    function (_message) {
      return Option.none();
    },
    function () {
      return Option.none();
    },
    function (cell) {
      return Option.some(Spot.point(cell, 0));
    },
    function (cell) {
      return Option.some(Spot.point(cell, Awareness.getEnd(cell)));
    }
  );
};

export {
  tryBr,
  process
};
