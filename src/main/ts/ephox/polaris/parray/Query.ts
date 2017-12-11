import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

/**
 * Simple "is position within unit" utility function
 */
var inUnit = function (unit, position) {
  return position >= unit.start() && position <= unit.finish();
};

/**
 * Finds the unit in the PositionArray that contains this offset (if there is one)
 */
var get = function (parray, offset) {
  return Arr.find(parray, function (x) {
    return inUnit(x, offset);
  });
};

var startindex = function (parray, offset) {
  return Arr.findIndex(parray, function (unit) {
    return unit.start() === offset;
  });
};

var tryend = function (parray, finish) {
  var finishes = parray[parray.length - 1] && parray[parray.length - 1].finish() === finish;
  return finishes ? parray.length + 1 : -1;
};


/**
 * Extracts the pieces of the PositionArray that are bounded *exactly* on the start and finish offsets
 */
var sublist = function (parray, start, finish) {
  var first = startindex(parray, start);
  var rawlast = startindex(parray, finish);
  return first.bind(function (fIndex) {
    var last = rawlast.getOr(tryend(parray, finish));
    return last > -1 ? Option.some(parray.slice(fIndex, last)) : Option.none();
  }).getOr([]);
};

var find = function (parray, pred) {
  return Arr.find(parray, pred);
};

export default <any> {
  get: get,
  find: find,
  inUnit: inUnit,
  sublist: sublist
};