import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import TextZone from '../general/TextZone';

const universe = DomUniverse();

const single = function (element: Element, envLang: string, onlyLang: string) {
  return TextZone.single(universe, element, envLang, onlyLang);
};

const range = function (start: Element, soffset: number, finish: Element, foffset: number, envLang: string, onlyLang: string) {
  return TextZone.range(universe, start, soffset, finish, foffset, envLang, onlyLang);
};

export default {
  single,
  range
};