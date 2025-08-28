import { DomUniverse } from '@ephox/boss';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { TypedItem } from '../data/TypedItem';
import { SpotPoint } from '../data/Types';
import * as Extract from '../general/Extract';

const universe = DomUniverse();

const from = (element: SugarElement, optimise?: (e: SugarElement) => boolean): TypedItem<SugarElement, Document>[] => {
  return Extract.from(universe, element, optimise);
};

const all = (element: SugarElement, optimise?: (e: SugarElement) => boolean): SugarElement[] => {
  return Extract.all(universe, element, optimise);
};

const extract = (child: SugarElement, offset: number, optimise?: (e: SugarElement) => boolean): SpotPoint<SugarElement> => {
  return Extract.extract(universe, child, offset, optimise);
};

const extractTo = (child: SugarElement, offset: number, pred: (e: SugarElement) => boolean, optimise?: (e: SugarElement) => boolean): SpotPoint<SugarElement> => {
  return Extract.extractTo(universe, child, offset, pred, optimise);
};

const find = (parent: SugarElement, offset: number, optimise?: (e: SugarElement) => boolean): Optional<SpotPoint<SugarElement>> => {
  return Extract.find(universe, parent, offset, optimise);
};

const toText = (element: SugarElement, optimise?: (e: SugarElement) => boolean): string => {
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
