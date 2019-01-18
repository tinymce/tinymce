import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Splitter from './Splitter';
import { PositionArray } from '@ephox/polaris';

/**
 * Split each text node in the list using the match endpoints.
 *
 * Each match is then mapped to the word it matched and the elements that make up the word.
 */
var separate = function (universe, list, matches) {
  var allPositions = Arr.bind(matches, function (match) {
    return [ match.start(), match.finish() ];
  });

  var subdivide = function (unit, positions) {
    return Splitter.subdivide(universe, unit.element(), positions);
  };

  var structure = PositionArray.splits(list, allPositions, subdivide);

  var collate = function (match) {
    var sub = PositionArray.sublist(structure, match.start(), match.finish());

    var elements = Arr.map(sub, function (unit) { return unit.element(); });

    var exact = Arr.map(elements, universe.property().getText).join('');
    return {
      elements: Fun.constant(elements),
      word: match.word,
      exact: Fun.constant(exact)
    };
  };

  return Arr.map(matches, collate);
};

export default {
  separate: separate
};