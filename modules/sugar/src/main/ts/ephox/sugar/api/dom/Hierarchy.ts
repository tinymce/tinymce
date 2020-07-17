import { Fun, Option } from '@ephox/katamari';
import { SugarElement } from '../node/SugarElement';
import * as Traverse from '../search/Traverse';
import * as Compare from './Compare';

/*
 * The exported functions in this module are:
 * a) path: Generates a list of child indices from the ancestor to the descendant
 * b) follow: Follows a path of child indices from an ancestor to reach a descendant
 */
const up = (descendant: SugarElement<Node>, stopper: (e: SugarElement<Node>) => boolean): Option<number[]> => {
  if (stopper(descendant)) {
    return Option.some([] as number[]);
  } else {
    return Traverse.parent(descendant).bind((parent) =>
      Traverse.findIndex(descendant).bind((index) => up(parent, stopper)
        .map((rest) => rest.concat([ index ]))));
  }
};

const path = (ancestor: SugarElement<Node>, descendant: SugarElement<Node>): Option<number[]> => {
  const stopper = Fun.curry(Compare.eq, ancestor);
  return Compare.eq(ancestor, descendant) ? Option.some<number[]>([]) : up(descendant, stopper);
};

const follow = (ancestor: SugarElement<Node>, descendantPath: number[]): Option<SugarElement<Node>> => {
  if (descendantPath.length === 0) {
    return Option.some(ancestor);
  } else {
    return Traverse.child(ancestor, descendantPath[0]).bind((child) => follow(child, descendantPath.slice(1)));
  }
};

export { path, follow };
