import { Fun } from '@ephox/katamari';
import { SimpleGenerators } from 'ephox/snooker/api/Generators';

export default function (): SimpleGenerators {
  let cellCounter = 0;
  let replaceCounter = 0;

  const cell = function () {
    const r = '?_' + cellCounter;
    cellCounter++;
    return r;
  };

  const replace = function (name: string) {
    const r = 'h(' + name + ')_' + replaceCounter;
    replaceCounter++;
    return r;
  };

  return {
    cell,
    gap: Fun.constant('*'),
    row: Fun.constant('tr'),
    replace
  } as unknown as SimpleGenerators; // fake generator for atomic tests
}