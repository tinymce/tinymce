import { Adt } from '@ephox/katamari';
import { Gather } from '@ephox/phoenix';
import { Split } from '@ephox/phoenix';

var adt = Adt.generate([
  { leftEdge: [ 'element' ] },
  { between: [ 'before', 'after' ] },
  { rightEdge: [ 'element' ] }
]);

var onText = function (universe, element, offset) {
  var raw = Split.split(universe, element, offset);
  var positions = Split.position(universe, raw);
  // Note, these cannot be curried because then more arguments are supplied than the adt expects.
  var l = function () { return adt.leftEdge(element); };
  var r = function () { return adt.rightEdge(element); };
  // None, Start, Middle, End
  return positions.fold(r, l, adt.between, r);
};

var onElement = function (universe, element, offset) {
  var children = universe.property().children(element);
  if (offset === 0) return adt.leftEdge(element);
  else if (offset === children.length) return adt.rightEdge(element);
  else if (offset > 0 && offset < children.length) return adt.between(children[offset - 1], children[offset]);
  // NOTE: This should not happen.
  else return adt.rightEdge(element);
};

var analyse = function (universe, element, offset, fallback) {
  if (universe.property().isText(element)) return onText(universe, element, offset);
  else if (universe.property().isEmptyTag(element)) return fallback(element);
  else return onElement(universe, element, offset);
};

// When breaking to the left, we will want to include the 'right' section of the split.
var toLeft = function (universe, isRoot, element, offset) {
  return analyse(universe, element, offset, adt.leftEdge).fold(function (e) {
    // We are at the left edge of the element, so take the whole element
    return e;
  }, function (b, a) {
    // We are splitting an element, so take the right side
    return a;
  }, function (e) {
    // We are at the right edge of the starting element, so gather the next element to the
    // right.
    return Gather.after(universe, e, isRoot).getOr(e);
  });
};

// When breaking to the right, we will want to include the 'left' section of the split.
var toRight = function (universe, isRoot, element, offset) {
  return analyse(universe, element, offset, adt.rightEdge).fold(function (e) {
    // We are at the left edge of the finishing element, so gather the previous element.
    return Gather.before(universe, e, isRoot).getOr(e);
  }, function (b, a) {
    // We are splitting an element, so take the left side.
    return b;
  }, function (e) {
    // We are the right edge of the element, so take the whole element
    return e;
  });
};

export default <any> {
  toLeft: toLeft,
  toRight: toRight
};