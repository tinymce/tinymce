import Injection from '../../injection/Injection';

var atStartOf = function (universe, element, offset, injection) {
  Injection.atStartOf(universe, element, offset, injection);
};

export default {
  atStartOf: atStartOf
};