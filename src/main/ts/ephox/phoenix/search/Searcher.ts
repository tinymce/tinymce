import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import NamedPattern from '../api/data/NamedPattern';
import Spot from '../api/data/Spot';
import Family from '../api/general/Family';
import TypedList from '../extract/TypedList';
import MatchSplitter from './MatchSplitter';
import { Pattern } from '@ephox/polaris';
import { PositionArray } from '@ephox/polaris';
import { Search } from '@ephox/polaris';

var gen = function (universe, input) {
  return PositionArray.generate(input, function (unit, offset) {
    var finish = offset + universe.property().getText(unit).length;
    return Option.from(Spot.range(unit, offset, finish));
  });
};

/**
 * Extracts groups of elements separated by boundaries.
 *
 * For each group, search the text for pattern matches.
 *
 * Returns a list of matches.
 */
var run = function (universe, elements, patterns, optimise) {
  var sections = Family.group(universe, elements, optimise);
  var result = Arr.bind(sections, function (x) {
    var input = TypedList.justText(x);
    var text = Arr.map(input, universe.property().getText).join('');

    var matches = Search.findmany(text, patterns);
    var plist = gen(universe, input);

    return MatchSplitter.separate(universe, plist, matches);
  });

  return result;
};


/**
 * Runs a search for one or more words
 */
var safeWords = function (universe, elements, words, optimise) {
  var patterns = Arr.map(words, function (word) {
    var pattern = Pattern.safeword(word);
    return NamedPattern(word, pattern);
  });
  return run(universe, elements, patterns, optimise);
};


/**
 * Runs a search for a single token
 */
var safeToken = function (universe, elements, token, optimise) {
  var pattern = NamedPattern(token, Pattern.safetoken(token));
  return run(universe, elements, [pattern], optimise);
};

export default {
  safeWords: safeWords,
  safeToken: safeToken,
  run: run
};