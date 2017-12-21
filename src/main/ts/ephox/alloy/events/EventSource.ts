import { Objects } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';

var derive = function (rawEvent, rawTarget) {
  var source = Objects.readOptFrom(rawEvent, 'target').map(function (getTarget) {
    return getTarget();
  }).getOr(rawTarget);

  return Cell(source);
};

export default <any> {
  derive: derive
};