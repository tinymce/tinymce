import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import * as Compare from './Compare';
import * as Traverse from '../search/Traverse';
import Element from '../node/Element';

/*
 * The exported functions in this module are:
 * a) path: Generates a list of child indices from the ancestor to the descendant
 * b) follow: Follows a path of child indices from an ancestor to reach a descendant
 */
var up = function (descendant: Element, stopper:(e: Element) => boolean): Option<number[]> {
  if (stopper(descendant)) return Option.some([]);
  return Traverse.parent(descendant).bind(function (parent) {
    return Traverse.findIndex(descendant).bind(function (index) {
      return up(parent, stopper).map(function (rest) {
        return rest.concat([ index ]);
      });
    });
  });
};

var path = function (ancestor: Element, descendant: Element) {
  var stopper = Fun.curry(Compare.eq, ancestor);
  return Compare.eq(ancestor, descendant) ? Option.some<number[]>([]) : up(descendant, stopper);
};

var follow = function (ancestor: Element, descendantPath: number[]): Option<Element> {
  if (descendantPath.length === 0) return Option.some(ancestor);
  else {
    return Traverse.child(ancestor, descendantPath[0]).bind(function (child) {
      return follow(child, descendantPath.slice(1));
    });
  }
};

export {
  path,
  follow,
};