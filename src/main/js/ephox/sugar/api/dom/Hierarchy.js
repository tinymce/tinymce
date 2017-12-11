import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Compare from './Compare';
import Traverse from '../search/Traverse';

/*
 * The exported functions in this module are:
 * a) path: Generates a list of child indices from the ancestor to the descendant
 * b) follow: Follows a path of child indices from an ancestor to reach a descendant
 */
var up = function (descendant, stopper) {
  if (stopper(descendant)) return Option.some([]);
  return Traverse.parent(descendant).bind(function (parent) {
    return Traverse.findIndex(descendant).bind(function (index) {
      return up(parent, stopper).map(function (rest) {
        return rest.concat([ index ]);
      });
    });
  });
};

var path = function (ancestor, descendant) {
  var stopper = Fun.curry(Compare.eq, ancestor);
  return Compare.eq(ancestor, descendant) ? Option.some([]) : up(descendant, stopper);
};

var follow = function (ancestor, descendantPath) {
  if (descendantPath.length === 0) return Option.some(ancestor);
  else {
    return Traverse.child(ancestor, descendantPath[0]).bind(function (child) {
      return follow(child, descendantPath.slice(1));
    });
  }
};

export default <any> {
  path: path,
  follow: follow
};