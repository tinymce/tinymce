import { Node as DomNode } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import Element from '../node/Element';
import * as Traverse from '../search/Traverse';
import * as Compare from './Compare';

/*
 * The exported functions in this module are:
 * a) path: Generates a list of child indices from the ancestor to the descendant
 * b) follow: Follows a path of child indices from an ancestor to reach a descendant
 */
const up = (descendant: Element<DomNode>, stopper: (e: Element<DomNode>) => boolean): Option<number[]> => {
  if (stopper(descendant)) {
    return Option.some([] as number[]);
  } else {
    return Traverse.parent(descendant).bind((parent) =>
      Traverse.findIndex(descendant).bind((index) => up(parent, stopper)
        .map((rest) => rest.concat([ index ]))));
  }
};

const path = (ancestor: Element<DomNode>, descendant: Element<DomNode>) => {
  const stopper = Fun.curry(Compare.eq, ancestor);
  return Compare.eq(ancestor, descendant) ? Option.some<number[]>([]) : up(descendant, stopper);
};

const follow = (ancestor: Element<DomNode>, descendantPath: number[]): Option<Element<DomNode>> => {
  if (descendantPath.length === 0) {
    return Option.some(ancestor);
  } else {
    return Traverse.child(ancestor, descendantPath[0]).bind((child) => follow(child, descendantPath.slice(1)));
  }
};

export { path, follow };
