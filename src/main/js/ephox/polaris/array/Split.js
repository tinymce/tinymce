import { Arr } from '@ephox/katamari';
import Splitting from '../api/Splitting';

/**
 * Split an array into chunks matched by the predicate
 */
var splitby = function (xs, pred) {
  return splitbyAdv(xs, function (x) {
    return pred(x) ? Splitting.excludeWithout(x) : Splitting.include(x);
  });
};

/**
 * Split an array into chunks matched by the predicate
 */
var splitbyAdv = function (xs, pred) {
  var r = [];
  var part = [];
  Arr.each(xs, function (x) {
    var choice = pred(x);
    Splitting.cata(choice, function () {
      // Include in the current sublist.
      part.push(x);
    }, function () {
      // Stop the current sublist, create a new sublist containing just x, and then start the next sublist.
      if (part.length > 0) r.push(part);
      r.push([ x ]);
      part = [];
    }, function () {
      // Stop the current sublist, and start the next sublist.
      if (part.length > 0) r.push(part);
      part = [];
    });
  });

  if (part.length > 0) r.push(part);
  return r;
};

export default <any> {
  splitby: splitby,
  splitbyAdv: splitbyAdv
};