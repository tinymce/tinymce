import { Arr, Fun, Option } from '@ephox/katamari';

/**
 * Generate a PositionArray
 *
 * xs:     list of thing
 * f:      thing -> Optional unit
 * start: sets the start position to search at
 */
const make = function <T, R extends { finish: () => number }> (xs: T[], f: (x: T, offset: number) => Option<R>, start: number = 0) {

  const init = {
    len: start,
    list: [] as R[]
  };

  const r = Arr.foldl(xs, function (acc, item) {
    const value = f(item, acc.len);
    return value.fold(Fun.constant(acc), function (v) {
      return {
        len: v.finish(),
        list: acc.list.concat([v])
      };
    });
  }, init);

  return r.list;
};

export {
  make
};