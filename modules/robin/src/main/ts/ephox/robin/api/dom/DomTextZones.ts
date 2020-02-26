import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import * as TextZones from '../general/TextZones';
import { ZoneViewports } from '../general/ZoneViewports';

const universe = DomUniverse();

const single = function (element: Element, envLang: string, viewport: ZoneViewports<Element>) {
  return TextZones.single(universe, element, envLang, viewport);
};

const range = function (start: Element, soffset: number, finish: Element, foffset: number, envLang: string, viewport: ZoneViewports<Element>) {
  return TextZones.range(universe, start, soffset, finish, foffset, envLang, viewport);
};

const empty = function () {
  return TextZones.empty<Element>();
};

export {
  single,
  range,
  empty
};
