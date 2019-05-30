import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Spot } from '@ephox/phoenix';
import { PositionArray } from '@ephox/polaris';

/**
 * Create a PositionArray of textnodes and returns the array along with the concatenated text.
 */
var get = function (universe, elements) {
  var list =  PositionArray.generate(elements, function (x, start) {
    return universe.property().isText(x) ?
      Option.some(Spot.range(x, start, start + universe.property().getText(x).length)) :
      Option.none();
  });

  var allText = Arr.foldr(list, function (b, a) {
    return universe.property().getText(a.element()) + b;
  }, '');

  return {
    list: Fun.constant(list),
    text: Fun.constant(allText)
  };
};

var cursor = function (universe, data, current, offset) {
  var position = PositionArray.find(data.list(), function (item) {
    return universe.eq(item.element(), current);
  }).map(function (element) {
    return element.start() + offset;
  });

  return {
    list: data.list,
    text: data.text,
    cursor: Fun.constant(position)
  };
};

/**
 * Extract information from text nodes in the elements array. Returns:
 * - a PositionArray of the text nodes
 * - the text found, as a string
 * - the cursor position of 'offset' in the text
 */
var from = function (universe, elements, current, offset) {
  var data = get(universe, elements);
  return cursor(universe, data, current, offset);
};

export default <any> {
  from: from
};