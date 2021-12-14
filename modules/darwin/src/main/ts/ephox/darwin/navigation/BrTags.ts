import { Optional } from '@ephox/katamari';
import { Spot, SpotPoint } from '@ephox/phoenix';
import { Awareness, ElementAddress, Situ, SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';

import { Situs } from '../selection/Situs';
import { BeforeAfter } from './BeforeAfter';
import { KeyDirection } from './KeyDirection';

const isBr = SugarNode.isTag('br');

const gatherer = (cand: SugarElement<Node>, gather: KeyDirection['gather'], isRoot: (e: SugarElement<Node>) => boolean): Optional<SugarElement<Node>> => {
  return gather(cand, isRoot).bind((target) => {
    return SugarNode.isText(target) && SugarText.get(target).trim().length === 0 ? gatherer(target, gather, isRoot) : Optional.some(target);
  });
};

const handleBr = (isRoot: (e: SugarElement<Node>) => boolean, element: SugarElement<Node>, direction: KeyDirection) => {
  // 1. Has a neighbouring sibling ... position relative to neighbouring element
  // 2. Has no neighbouring sibling ... position relative to gathered element
  return direction.traverse(element).orThunk(() => {
    return gatherer(element, direction.gather, isRoot);
  }).map(direction.relative);
};

const findBr = (element: SugarElement<Node>, offset: number) => {
  return Traverse.child(element, offset).filter(isBr).orThunk(() => {
    // Can be either side of the br, and still be a br.
    return Traverse.child(element, offset - 1).filter(isBr);
  });
};

const handleParent = (isRoot: (e: SugarElement<Node>) => boolean, element: SugarElement<Node>, offset: number, direction: KeyDirection) => {
  // 1. Has no neighbouring sibling, position relative to gathered element
  // 2. Has a neighbouring sibling, position at the neighbouring sibling with respect to parent
  return findBr(element, offset).bind((br) => {
    return direction.traverse(br).fold(() => {
      return gatherer(br, direction.gather, isRoot).map(direction.relative);
    }, (adjacent) => {
      return ElementAddress.indexInParent(adjacent).map((info) => {
        return Situ.on(info.parent, info.index);
      });
    });
  });
};

const tryBr = (isRoot: (e: SugarElement<Node>) => boolean, element: SugarElement<Node>, offset: number, direction: KeyDirection): Optional<Situs> => {
  // Three different situations
  // 1. the br is the child, and it has a previous sibling. Use parent, index-1)
  // 2. the br is the child and it has no previous sibling, set to before the previous gather result
  // 3. the br is the element and it has a previous sibling, use parent index-1)
  // 4. the br is the element and it has no previous sibling, set to before the previous gather result.
  // 2. the element is the br itself,
  const target = isBr(element) ? handleBr(isRoot, element, direction) : handleParent(isRoot, element, offset, direction);
  return target.map((tgt) => {
    return {
      start: tgt,
      finish: tgt
    };
  });
};

const process = (analysis: BeforeAfter): Optional<SpotPoint<SugarElement<HTMLTableCellElement>>> => {
  return BeforeAfter.cata(analysis,
    (_message) => {
      return Optional.none();
    },
    () => {
      return Optional.none();
    },
    (cell) => {
      return Optional.some(Spot.point(cell, 0));
    },
    (cell) => {
      return Optional.some(Spot.point(cell, Awareness.getEnd(cell)));
    }
  );
};

export {
  tryBr,
  process
};
