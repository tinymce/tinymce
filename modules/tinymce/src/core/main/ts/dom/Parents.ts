import { Fun } from '@ephox/katamari';
import { Compare, SugarElement, Traverse } from '@ephox/sugar';

const dropLast = <T>(xs: T[]): T[] => xs.slice(0, -1);

const parentsUntil = (start: SugarElement<Node>, root: SugarElement<Node>, predicate: (elm: SugarElement<Node>) => boolean): SugarElement<Node>[] => {
  if (Compare.contains(root, start)) {
    return dropLast(Traverse.parents(start, (elm) => {
      return predicate(elm) || Compare.eq(elm, root);
    }));
  } else {
    return [];
  }
};

const parents = (start: SugarElement<Node>, root: SugarElement<Node>): SugarElement<Node>[] => parentsUntil(start, root, Fun.never);

const parentsAndSelf = (start: SugarElement<Node>, root: SugarElement<Node>): SugarElement<Node>[] => [ start ].concat(parents(start, root));

export {
  parentsUntil,
  parents,
  parentsAndSelf
};
