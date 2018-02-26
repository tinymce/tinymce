import { Arr, Fun } from '@ephox/katamari';

/**
 * Generate a PositionArray
 *
 * xs:     list of thing
 * f:      thing -> Optional unit
 * _start: sets the start position to search at
 */
const generate = function (xs, f) {

  const init = {
    len: 0,
    list: []
  };

  const r = Arr.foldl(xs, function (b, a) {
    const value = f(a, b.len);
    return value.fold(Fun.constant(b), function (v) {
      return {
        len: v.finish(),
        list: b.list.concat([v])
      };
    });
  }, init);

  return r.list;
};

export {
  generate
};