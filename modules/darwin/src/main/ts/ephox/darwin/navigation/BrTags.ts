import { Optional } from '@ephox/katamari';
import { Spot, SpotPoint } from '@ephox/phoenix';
import { Awareness, ElementAddress, Situ, SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';
import { Situs } from '../selection/Situs';
import { BeforeAfter } from './BeforeAfter';
import { KeyDirection } from './KeyDirection';

const isBr = function (elem: SugarElement) {
  return SugarNode.name(elem) === 'br';
};

const gatherer = function (cand: SugarElement, gather: KeyDirection['gather'], isRoot: (e: SugarElement) => boolean): Optional<SugarElement> {
  return gather(cand, isRoot).bind(function (target) {
    return SugarNode.isText(target) && SugarText.get(target).trim().length === 0 ? gatherer(target, gather, isRoot) : Optional.some(target);
  });
};

const handleBr = function (isRoot: (e: SugarElement) => boolean, element: SugarElement, direction: KeyDirection) {
  // 1. Has a neighbouring sibling ... position relative to neighbouring element
  // 2. Has no neighbouring sibling ... position relative to gathered element
  return direction.traverse(element).orThunk(function () {
    return gatherer(element, direction.gather, isRoot);
  }).map(direction.relative);
};

const findBr = function (element: SugarElement, offset: number) {
  return Traverse.child(element, offset).filter(isBr).orThunk(function () {
    // Can be either side of the br, and still be a br.
    return Traverse.child(element, offset - 1).filter(isBr);
  });
};

const handleParent = function (isRoot: (e: SugarElement) => boolean, element: SugarElement, offset: number, direction: KeyDirection) {
  // 1. Has no neighbouring sibling, position relative to gathered element
  // 2. Has a neighbouring sibling, position at the neighbouring sibling with respect to parent
  return findBr(element, offset).bind(function (br) {
    return direction.traverse(br).fold(function () {
      return gatherer(br, direction.gather, isRoot).map(direction.relative);
    }, function (adjacent) {
      return ElementAddress.indexInParent(adjacent).map(function (info) {
        return Situ.on(info.parent, info.index);
      });
    });
  });
};

const tryBr = function (isRoot: (e: SugarElement) => boolean, element: SugarElement, offset: number, direction: KeyDirection): Optional<Situs> {
  // Three different situations
  // 1. the br is the child, and it has a previous sibling. Use parent, index-1)
  // 2. the br is the child and it has no previous sibling, set to before the previous gather result
  // 3. the br is the element and it has a previous sibling, use parent index-1)
  // 4. the br is the element and it has no previous sibling, set to before the previous gather result.
  // 2. the element is the br itself,
  const target = isBr(element) ? handleBr(isRoot, element, direction) : handleParent(isRoot, element, offset, direction);
  return target.map(function (tgt) {
    return {
      start: tgt,
      finish: tgt
    };
  });
};

const process = function (analysis: BeforeAfter): Optional<SpotPoint<SugarElement>> {
  return BeforeAfter.cata(analysis,
    function (_message) {
      return Optional.none();
    },
    function () {
      return Optional.none();
    },
    function (cell) {
      return Optional.some(Spot.point(cell, 0));
    },
    function (cell) {
      return Optional.some(Spot.point(cell, Awareness.getEnd(cell)));
    }
  );
};

export {
  tryBr,
  process
};
