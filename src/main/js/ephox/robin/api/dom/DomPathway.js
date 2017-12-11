import { DomUniverse } from '@ephox/boss';
import Pathway from '../general/Pathway';

var universe = DomUniverse();

var simplify = function (elements) {
  return Pathway.simplify(universe, elements);
};

var transform = function () {
  return Pathway.transform(universe);
};

export default <any> {
  simplify: simplify,
  transform: transform
};