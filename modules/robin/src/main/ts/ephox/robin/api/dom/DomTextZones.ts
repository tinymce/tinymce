import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';
import * as TextZones from '../general/TextZones';
import { ZoneViewports } from '../general/ZoneViewports';

const universe = DomUniverse();

const single = function (element: SugarElement, envLang: string, viewport: ZoneViewports<SugarElement>) {
  return TextZones.single(universe, element, envLang, viewport);
};

const range = function (start: SugarElement, soffset: number, finish: SugarElement, foffset: number, envLang: string, viewport: ZoneViewports<SugarElement>) {
  return TextZones.range(universe, start, soffset, finish, foffset, envLang, viewport);
};

const empty = function () {
  return TextZones.empty<SugarElement>();
};

export {
  single,
  range,
  empty
};
