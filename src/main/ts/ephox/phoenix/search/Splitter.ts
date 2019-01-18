import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Spot from '../api/data/Spot';
import { PositionArray } from '@ephox/polaris';
import { Strings } from '@ephox/polaris';

/**
 * Re-generates an item's text nodes, split as defined by the positions array.
 *
 * Returns a PositionArray of the result.
 */
var subdivide = function (universe, item, positions) {
  var text = universe.property().getText(item);
  var pieces = Arr.filter(Strings.splits(text, positions), function (section) {
    return section.length > 0;
  });

  if (pieces.length <= 1) return [ Spot.range(item, 0, text.length) ];
  universe.property().setText(item, pieces[0]);

  var others = PositionArray.generate(pieces.slice(1), function (a, start) {
    var nu = universe.create().text(a);
    var result = Spot.range(nu, start, start + a.length);
    return Option.some(result);
  }, pieces[0].length);

  var otherElements = Arr.map(others, function (a) { return a.element(); });
  universe.insert().afterAll(item, otherElements);

  return [ Spot.range(item, 0, pieces[0].length) ].concat(others);
};

export default {
  subdivide: subdivide
};