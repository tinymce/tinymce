import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Spot } from '@ephox/phoenix';
import { Gather } from '@ephox/phoenix';
import TextSearch from '../../textdata/TextSearch';
import TextSeeker from '../../textdata/TextSeeker';
import { Contracts } from '@ephox/katamari';

var seekerSig = Contracts.exactly([ 'regex', 'attempt' ]);

var previousChar = function (text, offset) {
  return TextSearch.previous(text, offset);
};

var nextChar = function (text, offset) {
  return TextSearch.next(text, offset);
};

// Returns: a TextSeeker outcome ADT of 'aborted', 'success', or 'edge'.
// 'success' returns a point {element, offset} to the left of (item, offset)
// successfully found using a process function.
// 'edge' returns the text element where the process stopped due to being adjacent to a
// block boundary.
var repeatLeft = function (universe, item, offset, process) {
  return TextSeeker.repeatLeft(universe, item, offset, process);
};

// Returns: a TextSeeker outcome ADT of 'aborted', 'success', or 'edge'.
// 'success' returns a point {element, offset} to the right of (item, offset)
// successfully found using a process function.
// 'edge' returns the text element where the process stopped due to being adjacent to a
// block boundary.
var repeatRight = function (universe, item, offset, process) {
  return TextSeeker.repeatRight(universe, item, offset, process);
};

// Returns: a TextSeeker outcome ADT of 'aborted', 'success', or 'edge'.
// 'success' returns a point {element, offset} to the left of (item, offset)
// successfully found using a regular expression (rawSeeker object) on the text content.
// 'edge' returns the text element where the search stopped due to being adjacent to a
// block boundary.
var expandLeft = function (universe, item, offset, rawSeeker) {
  var seeker = seekerSig(rawSeeker);

  var process = function (uni, phase, pItem, pText, pOffset) {
    var lastOffset = pOffset.getOr(pText.length);
    return TextSearch.rfind(pText.substring(0, lastOffset), seeker.regex()).fold(function () {
      // Did not find a word break, so continue;
      return phase.kontinue();
    }, function (index) {
      return seeker.attempt(phase, pItem, pText, index);
    });
  };
  return repeatLeft(universe, item, offset, process);
};

// Returns: a TextSeeker outcome ADT of 'aborted', 'success', or 'edge'.
// 'success' returns a point {element, offset} to the right of (item, offset)
// successfully found using a regular expression (rawSeeker object) on the text content.
// 'edge' returns the text element where the search stopped due to being adjacent to a
// block boundary.
var expandRight = function (universe, item, offset, rawSeeker) {
  var seeker = seekerSig(rawSeeker);

  var process = function (uni, phase, pItem, pText, pOffset) {
    var firstOffset = pOffset.getOr(0);
    return TextSearch.lfind(pText.substring(firstOffset), seeker.regex()).fold(function () {
      // Did not find a word break, so continue;
      return phase.kontinue();
    }, function (index) {
      return seeker.attempt(phase, pItem, pText, firstOffset + index);
    });
  };

  return repeatRight(universe, item, offset, process);
};

// Identify the (element, offset) pair ignoring potential fragmentation. Follow the offset
// through until the offset left is 0. This is designed to find text node positions that
// have been fragmented.
var scanRight = function (universe, item, originalOffset) {
  var isRoot = Fun.constant(false);
  if (! universe.property().isText(item)) return Option.none();
  var text = universe.property().getText(item);
  if (originalOffset <= text.length) return Option.some(Spot.point(item, originalOffset));
  else return Gather.seekRight(universe, item, universe.property().isText, isRoot).bind(function (next) {
    return scanRight(universe, next, originalOffset - text.length);
  });
};

export default <any> {
  previousChar: previousChar,
  nextChar: nextChar,
  repeatLeft: repeatLeft,
  repeatRight: repeatRight,
  expandLeft: expandLeft,
  expandRight: expandRight,
  scanRight: scanRight
};