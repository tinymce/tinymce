import { Fun } from '@ephox/katamari';



export default function () {
  var cellCounter = 0;
  var replaceCounter = 0;

  var cell = function () {
    var r = '?_' + cellCounter;
    cellCounter++;
    return r;
  };

  var replace = function (name) {
    var r = 'h(' + name + ')_' + replaceCounter;
    replaceCounter++;
    return r;
  };

  return {
    cell: cell,
    gap: Fun.constant('*'),
    row: Fun.constant('tr'),
    replace: replace
  };
};