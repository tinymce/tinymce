import { Fun } from '@ephox/katamari';

export default function () {
  let cellCounter = 0;
  let replaceCounter = 0;

  const cell = function () {
    const r = '?_' + cellCounter;
    cellCounter++;
    return r;
  };

  const replace = function (name) {
    const r = 'h(' + name + ')_' + replaceCounter;
    replaceCounter++;
    return r;
  };

  return {
    cell,
    gap: Fun.constant('*'),
    row: Fun.constant('tr'),
    replace
  };
}