import { DomUniverse } from '@ephox/boss';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { SpotPoint } from '../data/Types';
import * as Extract from '../general/Extract';

const universe = DomUniverse();

const from = function (element: SugarElement, optimise?: (e: SugarElement) => boolean) {
  return Extract.from(universe, element, optimise);
};

const all = function (element: SugarElement, optimise?: (e: SugarElement) => boolean) {
  return Extract.all(universe, element, optimise);
};

const extract = function (child: SugarElement, offset: number, optimise?: (e: SugarElement) => boolean) {
  return Extract.extract(universe, child, offset, optimise);
};

const extractTo = function (child: SugarElement, offset: number, pred: (e: SugarElement) => boolean, optimise?: (e: SugarElement) => boolean) {
  return Extract.extractTo(universe, child, offset, pred, optimise);
};

const find = function (parent: SugarElement, offset: number, optimise?: (e: SugarElement) => boolean): Optional<SpotPoint<SugarElement>> {
  return Extract.find(universe, parent, offset, optimise);
};

const toText = function (element: SugarElement, optimise?: (e: SugarElement) => boolean) {
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
