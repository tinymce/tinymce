import { Arr, Obj, Option, Struct } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

interface WeightedItem {
  weight: number;
}

interface AccWeightItem {
  accWeight: number;
}

interface WeightedList<T extends WeightedItem> {
  list: () => (T & AccWeightItem)[];
  total: () => number;
}

const weighted: <T extends WeightedItem> (list: (T & AccWeightItem)[], total: number) => WeightedList<T> = Struct.immutable('list', 'total');

const choose = <T extends WeightedItem>(candidates: T[]) => {
  const result = Arr.foldl(candidates, (rest, d) => {
    const newTotal = rest.total + d.weight;
    const merged: T & AccWeightItem = {
      ...d,
      accWeight: newTotal
    };
    return {
      total: newTotal,
      list: rest.list.concat([ merged ])
    };
  }, { list: <(T & AccWeightItem)[]> [], total: 0 });

  return weighted(result.list, result.total);
};

const gChoose = <T extends WeightedItem>(weighted: WeightedList<T>) => Jsc.number(0, weighted.total()).generator.map((w) => {
  const raw = Arr.find(weighted.list(), (d) =>
    w <= d.accWeight
  );

  const keys = raw.map(Obj.keys).getOr([]);
  return keys.length === [ 'weight', 'accWeight' ].length ? Option.none() : raw;
});

const generator = <T extends WeightedItem>(candidates: T[]) => {
  const list = choose(candidates);
  return gChoose(list);
};

export const WeightedChoice = {
  generator
};
