import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Extract from './Extract';

var newline = '\n';
var space = ' ';

var onEmpty = function (item, universe) {
  return universe.property().name(item) === 'img' ? space : newline;
};

var from = function (universe, item, optimise) {
  var typed = Extract.typed(universe, item, optimise);
  return Arr.map(typed, function (t) {
    return t.fold(Fun.constant(newline), onEmpty, universe.property().getText);
  }).join('');
};

export default {
  from: from
};