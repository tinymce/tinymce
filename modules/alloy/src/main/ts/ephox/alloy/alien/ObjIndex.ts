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

type OuterKey = string;
type InnerKey = string;

const byInnerKey = <T, O>(data: Record<OuterKey, Record<InnerKey, T>>, tuple: (s: string, t: T) => O):
Record<InnerKey, O[]> => {

  const r: Record<InnerKey, O[]> = {};
  Obj.each(data, (detail: Record<InnerKey, T>, key: OuterKey) => {
    Obj.each(detail, (value: T, indexKey: InnerKey) => {
      const chain: O[] = Obj.get(r, indexKey).getOr([]);
      r[indexKey] = chain.concat([
        tuple(key, value)
      ]);
    });
  });
  return r;
};

export {
  byInnerKey
};
