import { DomUniverse } from '@ephox/boss';
import Textdata from '../general/Textdata';

var universe = DomUniverse();

var from = function (elements, current, offset) {
  return Textdata.from(universe, elements, current, offset);
};

export default <any> {
  from: from
};