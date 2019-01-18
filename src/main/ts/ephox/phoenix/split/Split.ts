import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import TextSplit from '../api/data/TextSplit';
import { Strings } from '@ephox/polaris';

var tokens = function (universe, item, ps) {
  var text = universe.property().getText(item);
  return Strings.splits(text, ps);
};

/**
 * Return a TextSplit of item split at position.
 *
 * Edge cases:
 *   pos at start:      (none, some(item))
 *   pos at end:        (some(item), none)
 *   item is not text:  (none, some(item))
 */
var split = function (universe, item, position) {
  if (!universe.property().isText(item)) return TextSplit(Option.none(), Option.some(item));
  if (position <= 0) return TextSplit(Option.none(), Option.some(item));
  if (position >= universe.property().getText(item).length) return TextSplit(Option.some(item), Option.none());

  var parts = tokens(universe, item, [position]);
  universe.property().setText(item, parts[0]);
  var after = universe.create().text(parts[1]);
  universe.insert().after(item, after);
  return TextSplit(Option.some(item), Option.some(after));
};

/**
 * Split an item into three parts, and return the middle.
 *
 * If no split is required, return the item.
 */
var splitByPair = function (universe, item, start, end) {
  if (!universe.property().isText(item) || start === end) return item;
  if (start > end) return splitByPair(universe, item, end, start);

  var len = universe.property().getText(item).length;
  if (start === 0 && end === len) return item;

  var parts = tokens(universe, item, [start, end]);

  // Rewrite the item to be the first section of the split
  universe.property().setText(item, parts[0]);

  // Create new text nodes for the split text sections
  var newText = Arr.map(parts.slice(1), function (text) { return universe.create().text(text); });
  var middle = newText[0];

  // Append new items
  universe.insert().afterAll(item, newText);

  // If there is no before element, item becomes the "middle"
  return start === 0 ? item : middle;
};

export default {
  split: split,
  splitByPair: splitByPair
};