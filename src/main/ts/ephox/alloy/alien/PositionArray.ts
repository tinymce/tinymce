import { Arr, Fun, Option } from '@ephox/katamari';

export interface PositionableUnit {
  finish: () => number;
}

const generate = <T, U extends PositionableUnit>(xs: T[], f: (thing: T, n: number) => Option<U>): U[] => {
  const init = {
    len: 0,
    list: [] as U[]
  };

  const r = Arr.foldl(xs, (b, a) => {
    const value = f(a, b.len);
    return value.fold(Fun.constant(b), (v) => {
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