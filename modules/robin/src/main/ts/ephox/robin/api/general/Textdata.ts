import { Universe } from '@ephox/boss';
import { Arr, Option } from '@ephox/katamari';
import { Spot, SpotRange } from '@ephox/phoenix';
import { PositionArray } from '@ephox/polaris';

interface TextdataGet<E> {
  readonly list: SpotRange<E>[];
  readonly text: string;
}

export interface Textdata<E> extends TextdataGet<E> {
  readonly cursor: Option<number>;
}

/**
 * Create a PositionArray of textnodes and returns the array along with the concatenated text.
 */
const get = function <E, D> (universe: Universe<E, D>, elements: E[]) {
  const list = PositionArray.generate(elements, function (x, start) {
    return universe.property().isText(x) ?
      Option.some(Spot.range(x, start, start + universe.property().getText(x).length)) :
      Option.none<SpotRange<E>>();
  });

  const allText = Arr.foldr(list, function (b, a) {
    return universe.property().getText(a.element()) + b;
  }, '');

  return {
    list,
    text: allText
  };
};

const cursor = function <E, D> (universe: Universe<E, D>, data: TextdataGet<E>, current: E, offset: number): Textdata<E> {
  const position = PositionArray.find(data.list, function (item) {
    return universe.eq(item.element(), current);
  }).map(function (element) {
    return element.start() + offset;
  });

  return {
    list: data.list,
    text: data.text,
    cursor: position
  };
};

/**
 * Extract information from text nodes in the elements array. Returns:
 * - a PositionArray of the text nodes
 * - the text found, as a string
 * - the cursor position of 'offset' in the text
 */
const from = function <E, D> (universe: Universe<E, D>, elements: E[], current: E, offset: number) {
  const data = get(universe, elements);
  return cursor(universe, data, current, offset);
};

export const Textdata = {
  from
};
