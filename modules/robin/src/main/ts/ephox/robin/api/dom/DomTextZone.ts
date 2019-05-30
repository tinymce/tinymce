import { DomUniverse } from '@ephox/boss';
import TextZone from '../general/TextZone';

var universe = DomUniverse();

var single = function (element, envLang, onlyLang) {
  return TextZone.single(universe, element, envLang, onlyLang);
};

var range = function (start, soffset, finish, foffset, envLang, onlyLang) {
  return TextZone.range(universe, start, soffset, finish, foffset, envLang, onlyLang);
};

export default <any> {
  single: single,
  range: range
};