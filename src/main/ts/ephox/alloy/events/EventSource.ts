import { Objects } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';

const derive = function (rawEvent, rawTarget) {
  const source = Objects.readOptFrom(rawEvent, 'target').map(function (getTarget) {
    return getTarget();
  }).getOr(rawTarget);

  return Cell(source);
};

export {
  derive
};