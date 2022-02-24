import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';

const createRange = (sc: Node, so: number, ec: Node, eo: number): Range => {
  const rng = document.createRange();
  rng.setStart(sc, so);
  rng.setEnd(ec, eo);
  return rng;
};

// If you triple click a paragraph in this case:
//   <blockquote><p>a</p></blockquote><p>b</p>
// It would become this range in webkit:
//   <blockquote><p>[a</p></blockquote><p>]b</p>
// We would want it to be:
//   <blockquote><p>[a]</p></blockquote><p>b</p>
// Since it would otherwise produces spans out of thin air on insertContent for example.
const normalizeBlockSelectionRange = (rng: Range): Range => {
  const startPos = CaretPosition.fromRangeStart(rng);
  const endPos = CaretPosition.fromRangeEnd(rng);
  const rootNode = rng.commonAncestorContainer;

  return CaretFinder.fromPosition(false, rootNode, endPos)
    .map((newEndPos) => {
      if (!CaretUtils.isInSameBlock(startPos, endPos, rootNode) && CaretUtils.isInSameBlock(startPos, newEndPos, rootNode)) {
        return createRange(startPos.container(), startPos.offset(), newEndPos.container(), newEndPos.offset());
      } else {
        return rng;
      }
    }).getOr(rng);
};

const normalize = (rng: Range): Range => rng.collapsed ? rng : normalizeBlockSelectionRange(rng);

export {
  normalize
};
