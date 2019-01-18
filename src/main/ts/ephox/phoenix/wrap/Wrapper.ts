import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Spot from '../api/data/Spot';
import Split from '../api/general/Split';
import Contiguous from '../util/Contiguous';
import Navigation from './Navigation';

/**
 * Wrap all text nodes between two DOM positions, using the nu() wrapper
 */
var wrapWith = function (universe, base, baseOffset, end, endOffset, nu) {
  var nodes = Split.range(universe, base, baseOffset, end, endOffset);
  return wrapper(universe, nodes, nu);
};

/**
 * Wrap non-empty text nodes using the nu() wrapper
 */
var wrapper = function (universe, wrapped, nu) {
  if (wrapped.length === 0) return wrapped;

  var filtered = Arr.filter(wrapped, function (x) {
    return universe.property().isText(x) && universe.property().getText(x).length > 0;
  });

  return Arr.map(filtered, function (w) {
    var container = nu();
    universe.insert().before(w, container.element());
    container.wrap(w);
    return container.element();
  });
};

/**
 * Return the cursor positions at the start and end of a collection of wrapper elements
 */
var endPoints = function (universe, wrapped) {
  return Option.from(wrapped[0]).map(function (first) {
    // INVESTIGATE: Should this one navigate to the next child when first isn't navigating down a level?
    var last = Navigation.toLower(universe, wrapped[wrapped.length - 1]);
    return Spot.points(
      Spot.point(first, 0),
      Spot.point(last.element(), last.offset())
    );
  });
};

/**
 * Calls wrapWith() on text nodes in the range, and returns the end points
 */
var leaves = function (universe, base, baseOffset, end, endOffset, nu) {
  var start = Navigation.toLeaf(universe, base, baseOffset);
  var finish = Navigation.toLeaf(universe, end, endOffset);
  var wrapped = wrapWith(universe, start.element(), start.offset(), finish.element(), finish.offset(), nu);
  return endPoints(universe, wrapped);
};

/*
 * Returns a list of spans (reusing where possible) that wrap the text nodes within the range
 */
var reuse = function (universe, base, baseOffset, end, endOffset, predicate, nu) {
  var start = Navigation.toLeaf(universe, base, baseOffset);
  var finish = Navigation.toLeaf(universe, end, endOffset);
  var nodes = Split.range(universe, start.element(), start.offset(), finish.element(), finish.offset());

  var groups = Contiguous.textnodes(universe, nodes);

  var canReuse = function (group) {
    // TODO: Work out a sensible way to consider empty text nodes here.
    var children = universe.property().children(group.parent);
    return children.length === group.children.length && predicate(group.parent);
  };

  var recycle = function (group) {
    return group.parent;
  };

  var create = function (group) {
    var container = nu();
    universe.insert().before(group.children[0], container.element());
    Arr.each(group.children, container.wrap);
    return container.element();
  };

  return Arr.map(groups, function (group) {
    // return parent if it can be reused (e.g. span with no other children), otherwise make a new one.
    var builder = canReuse(group) ? recycle : create;
    return builder(group);
  });
};

export default {
  wrapWith: wrapWith,
  wrapper: wrapper,
  leaves: leaves,
  reuse: reuse
};