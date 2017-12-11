import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Parent from '../api/general/Parent';
import Clustering from '../words/Clustering';
import WordDecision from '../words/WordDecision';
import LanguageZones from './LanguageZones';
import ZoneWalker from './ZoneWalker';
import Zones from './Zones';

var rangeOn = function (universe, first, last, envLang, transform, viewport) {
  var ancestor = universe.eq(first, last) ? Option.some(first) : universe.property().parent(first);
  return ancestor.map(function (parent) {
    var defaultLang = LanguageZones.calculate(universe, parent).getOr(envLang);
    return ZoneWalker.walk(universe, first, last, defaultLang, transform, viewport);
  });
};

var fromBoundedWith = function (universe, left, right, envLang, transform, viewport) {
  var groups = Parent.subset(universe, left, right).bind(function (children) {
    if (children.length === 0) return Option.none();
    var first = children[0];
    var last = children[children.length - 1];
    return rangeOn(universe, first, last, envLang, transform, viewport);
  }).getOr([ ]);

  return Zones.fromWalking(universe, groups);
};

var fromBounded = function (universe, left, right, envLang, viewport) {
  return fromBoundedWith(universe, left, right, envLang, WordDecision.detail, viewport);
};

var fromRange = function (universe, start, finish, envLang, viewport) {
  var edges = Clustering.getEdges(universe, start, finish, Fun.constant(false));
  var transform = transformEdges(edges.left(), edges.right());
  return fromBoundedWith(universe, edges.left().item(), edges.right().item(), envLang, transform, viewport);
};

var transformEdges = function (leftEdge, rightEdge) {
  return function (universe, element) {
    return universe.eq(element, leftEdge.item()) ? leftEdge :
      universe.eq(element, rightEdge.item()) ? rightEdge : WordDecision.detail(universe, element);
  };
};

var fromInline = function (universe, element, envLang, viewport) {
  // Create a cluster that branches to the edge of words, and then apply the zones. We will move
  // past language boundaries, because we might need to be retokenizing words post a language
  // change
  var bounded = Clustering.byBoundary(universe, element);
  var transform = transformEdges(bounded.left(), bounded.right());
  return bounded.isEmpty() ? empty() : fromBoundedWith(universe, bounded.left().item(), bounded.right().item(), envLang, transform, viewport);
};

var empty = function () {
  return {
    zones: Fun.constant([ ])
  };
};

export default <any> {
  fromRange: fromRange,
  transformEdges: transformEdges,
  fromBounded: fromBounded,
  fromBoundedWith: fromBoundedWith,
  fromInline: fromInline,
  empty: empty
};