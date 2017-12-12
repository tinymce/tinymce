import { Objects } from '@ephox/boulder';
import { Obj } from '@ephox/katamari';

/*
 * This is used to take something like:
 *
 * {
 *   behaviour: {
 *     event1: listener
 *   },
 *   behaviour2: {
 *     event1: listener
 *   }
 * }
 *
 * And turn it into something like:
 *
 * {
 *   event1: [ { b: behaviour1, l: listener }, { b: behaviour2, l: listener } ]
 * }
 */


var byInnerKey = function (data, tuple) {
  var r = {};
  Obj.each(data, function (detail, key) {
    Obj.each(detail, function (value, indexKey) {
      var chain = Objects.readOr(indexKey, [ ])(r);
      r[indexKey] = chain.concat([
        tuple(key, value)
      ]);
    });
  });
  return r;
};

export default <any> {
  byInnerKey: byInnerKey
};