import { DomUniverse } from '@ephox/boss';
import TextZones from '../general/TextZones';

var universe = DomUniverse();

var single = function (element, envLang, viewport) {
  return TextZones.single(universe, element, envLang, viewport);
};

var range = function (start, soffset, finish, foffset, envLang, viewport) {
  return TextZones.range(universe, start, soffset, finish, foffset, envLang, viewport);
};

var empty = function () {
  return TextZones.empty();
};

export default <any> {
  single: single,
  range: range,
  empty: empty
};