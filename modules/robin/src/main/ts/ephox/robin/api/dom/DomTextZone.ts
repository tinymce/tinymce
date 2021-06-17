import { DomUniverse } from '@ephox/boss';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as TextZone from '../general/TextZone';

const universe = DomUniverse();

const single = (element: SugarElement, envLang: string, onlyLang: string): Optional<TextZone.Zone<SugarElement>> => {
  return TextZone.single(universe, element, envLang, onlyLang);
};

const range = (start: SugarElement, soffset: number, finish: SugarElement, foffset: number, envLang: string, onlyLang: string): Optional<TextZone.Zone<SugarElement>> => {
  return TextZone.range(universe, start, soffset, finish, foffset, envLang, onlyLang);
};

export {
  single,
  range
};
