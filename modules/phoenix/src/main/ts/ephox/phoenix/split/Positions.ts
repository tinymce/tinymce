import { SplitPosition } from '../api/data/SplitPosition';
import { TextSplit } from '../api/data/TextSplit';

/*
 * Categorise a split of a text node as: none, start, middle, or end
 */
const determine = <E>(target: TextSplit<E>): SplitPosition<E> => {
  return target.before.fold(() => {
    return target.after.fold(() => {
      return SplitPosition.none<E>();
    }, (a) => {
      return SplitPosition.start(a);
    });
  }, (b) => {
    return target.after.fold(() => {
      return SplitPosition.end(b);
    }, (a) => {
      return SplitPosition.middle(b, a);
    });
  });
};

export {
  determine
};
