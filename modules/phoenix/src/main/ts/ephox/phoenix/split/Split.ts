import { Universe } from '@ephox/boss';
import { Arr, Option } from '@ephox/katamari';
import { Strings } from '@ephox/polaris';
import { TextSplit } from '../api/data/TextSplit';

const tokens = function <E, D> (universe: Universe<E, D>, item: E, ps: number[]) {
  const text = universe.property().getText(item);
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
const split = function <E, D> (universe: Universe<E, D>, item: E, position: number): TextSplit<E> {
  if (!universe.property().isText(item)) {
    return TextSplit(Option.none(), Option.some(item));
  }
  if (position <= 0) {
    return TextSplit(Option.none(), Option.some(item));
  }
  if (position >= universe.property().getText(item).length) {
    return TextSplit(Option.some(item), Option.none());
  }

  const parts = tokens(universe, item, [ position ]);
  universe.property().setText(item, parts[0]);
  const after = universe.create().text(parts[1]);
  universe.insert().after(item, after);
  return TextSplit(Option.some(item), Option.some(after));
};

/**
 * Split an item into three parts, and return the middle.
 *
 * If no split is required, return the item.
 */
const splitByPair = function <E, D> (universe: Universe<E, D>, item: E, start: number, end: number): E {
  if (!universe.property().isText(item) || start === end) {
    return item;
  }
  if (start > end) {
    return splitByPair(universe, item, end, start);
  }

  const len = universe.property().getText(item).length;
  if (start === 0 && end === len) {
    return item;
  }

  const parts = tokens(universe, item, [ start, end ]);

  // Rewrite the item to be the first section of the split
  universe.property().setText(item, parts[0]);

  // Create new text nodes for the split text sections
  const newText = Arr.map(parts.slice(1), function (text) { return universe.create().text(text); });
  const middle = newText[0];

  // Append new items
  universe.insert().afterAll(item, newText);

  // If there is no before element, item becomes the "middle"
  return start === 0 ? item : middle;
};

export {
  split,
  splitByPair
};
