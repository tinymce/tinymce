import { Adt } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Spot } from '@ephox/phoenix';
import { Descent } from '@ephox/phoenix';
import { Gather } from '@ephox/phoenix';
import { Seeker } from '@ephox/phoenix';
import Structure from '../api/general/Structure';

var walkLeft = Gather.walkers().left();
var walkRight = Gather.walkers().right();

var phase = Adt.generate([
  { abort: [  ] },
  { kontinue: [ ] },
  { finish: [ 'info' ] }
]);

var outcome = Adt.generate([
  { aborted: [] },
  { edge: [ 'element' ] },
  { success: [ 'info' ] }
]);

var isBoundary = function (universe, item) {
  return Structure.isEmptyTag(universe, item) || universe.property().isBoundary(item);
};

var repeat = function (universe, item, mode, offsetOption, process, walking, recent) {
  var terminate = function () {
    return recent.fold(outcome.aborted, outcome.edge);
  };

  var recurse = function (newRecent) {
    return Gather.walk(universe, item, mode, walking).fold(
      terminate,
      function (prev) {
        return repeat(universe, prev.item(), prev.mode(), Option.none(), process, walking, newRecent);
      }
    );
  };

  if (isBoundary(universe, item)) return terminate();
  else if (! universe.property().isText(item)) return recurse(recent);
  else {
    var text = universe.property().getText(item);
    return process(universe, phase, item, text, offsetOption).fold(terminate, function () {
      return recurse(Option.some(item));
    }, outcome.success);
  }
};

var descendToLeft = function (universe, item, offset, isRoot) {
  var descended = Descent.toLeaf(universe, item, offset);
  if (universe.property().isText(item)) return Option.none();
  else {
    return Seeker.left(universe, descended.element(), universe.property().isText, isRoot).map(function (t) {
      return Spot.point(t, universe.property().getText(t).length);
    });
  }
};

var descendToRight = function (universe, item, offset, isRoot) {
  var descended = Descent.toLeaf(universe, item, offset);
  if (universe.property().isText(item)) return Option.none();
  else {
    return Seeker.right(universe, descended.element(), universe.property().isText, isRoot).map(function (t) {
      return Spot.point(t, 0);
    });
  }
};

var findTextNeighbour = function (universe, item, offset) {
  var stopAt = Fun.curry(isBoundary, universe);
  return descendToLeft(universe, item, offset, stopAt).orThunk(function () {
    return descendToRight(universe, item, offset, stopAt);
  }).getOr(Spot.point(item, offset));
};

var repeatLeft = function (universe, item, offset, process) {
  var initial = findTextNeighbour(universe, item, offset);
  return repeat(universe, initial.element(), Gather.sidestep, Option.some(initial.offset()), process, walkLeft, Option.none());
};

var repeatRight = function (universe, item, offset, process) {
  var initial = findTextNeighbour(universe, item, offset);
  return repeat(universe, initial.element(), Gather.sidestep, Option.some(initial.offset()), process, walkRight, Option.none());
};

export default <any> {
  repeatLeft: repeatLeft,
  repeatRight: repeatRight
};