import { DomUniverse } from '@ephox/boss';
import Injection from '../general/Injection';

var universe = DomUniverse();

var atStartOf = function (element, offset, injection) {
  Injection.atStartOf(universe, element, offset, injection);
};

export default {
  atStartOf: atStartOf
};