import { DomUniverse } from '@ephox/boss';
import LeftBlock from '../general/LeftBlock';

var universe = DomUniverse();

var top = function (item) {
  return LeftBlock.top(universe, item);
};

var all = function (item) {
  return LeftBlock.all(universe, item);
};

export default <any> {
  top: top,
  all: all
};