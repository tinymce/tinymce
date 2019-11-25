import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import * as Extract from '../general/Extract';
import { Option } from '@ephox/katamari';
import { SpotPoint } from '../data/Types';

const universe = DomUniverse();

const from = function (element: Element, optimise?: (e: Element) => boolean) {
  return Extract.from(universe, element, optimise);
};

const all = function (element: Element, optimise?: (e: Element) => boolean) {
  return Extract.all(universe, element, optimise);
};

const extract = function (child: Element, offset: number, optimise?: (e: Element) => boolean) {
  return Extract.extract(universe, child, offset, optimise);
};

const extractTo = function (child: Element, offset: number, pred: (e: Element) => boolean, optimise?: (e: Element) => boolean) {
  return Extract.extractTo(universe, child, offset, pred, optimise);
};

const find = function (parent: Element, offset: number, optimise?: (e: Element) => boolean): Option<SpotPoint<Element>> {
  return Extract.find(universe, parent, offset, optimise);
};

const toText = function (element: Element, optimise?: (e: Element) => boolean) {
  return Extract.toText(universe, element, optimise);
};

export {
  extract,
  extractTo,
  all,
  from,
  find,
  toText
};
