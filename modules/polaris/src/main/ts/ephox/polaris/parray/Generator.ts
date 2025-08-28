import { Arr, Fun, Optional } from '@ephox/katamari';

/**
 * Generate a PositionArray
 *
 * xs:     list of thing
 * f:      thing -> Optional unit
 * start: sets the start position to search at
 */
const make = <T, R extends { finish: number }>(xs: T[], f: (x: T, offset: number) => Optional<R>, start: number = 0): R[] => {

  const init = {
    len: start,
    list: [] as R[]
  };

  const r = Arr.foldl(xs, (acc, item) => {
    const value = f(item, acc.len);
    return value.fold(Fun.constant(acc), (v) => {
      return {
        len: v.finish,
        list: acc.list.concat([ v ])
      };
    });
  }, init);

  return r.list;
};

export {
  make
};
