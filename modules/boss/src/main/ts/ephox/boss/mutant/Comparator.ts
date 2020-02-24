import * as Attribution from './Attribution';
import { Arr, Option } from '@ephox/katamari';
import { Gene } from '../api/Gene';

const ATTR_REGEX = /^\[(.*)\]$/;

const eq = function (a: Gene, b: Gene) {
  return a.id === undefined && b.id === undefined ? a.name === b.name : a.id === b.id;
};

// Obviously, we can't support full selector syntax, so ...
// Selector support, either:
// 'name,name,...' : comma-list of names to compare against item name
// '[attr]'        : single attribute 'attr' key present in item attrs
const is = function (item: Gene, selector: string) {
  const tagMatch = function () {
    const matches = selector.split(',');
    return Arr.contains(matches, item.name);
  };
  const attrMatch = function (match: RegExpMatchArray) {
    return (Attribution.get(item, match[1]) !== undefined);
  };
  return Option.from(selector.match(ATTR_REGEX)).fold(tagMatch, attrMatch);
};

export {
  eq,
  is
};
