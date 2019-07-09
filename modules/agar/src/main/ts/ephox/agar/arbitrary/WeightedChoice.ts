import { Arr, Merger, Obj, Option, Struct } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

interface WeightedItem {
  weight: number;
}

interface AccWeightItem extends WeightedItem {
  accWeight: number;
}

interface WeightedList<T> {
  list: () => (T & AccWeightItem)[];
  total: () => number;
}

const weighted: <T> (list: (T & AccWeightItem)[], total: number) => WeightedList<T> = Struct.immutable('list', 'total');

const choose = function <T extends WeightedItem>(candidates: T[]) {
  const result = Arr.foldl(candidates, function (rest, d) {
    const newTotal = rest.total + d.weight;
    const merged: T & AccWeightItem = Merger.merge(d, {
      accWeight: newTotal
    });
    return {
      total: newTotal,
      list: rest.list.concat([merged])
    };
  }, { list: <(T & AccWeightItem)[]> [], total: 0 });

  return weighted(result.list, result.total);
};

const gChoose = function <T>(weighted: WeightedList<T>) {
  return Jsc.number(0, weighted.total()).generator.map(function (w) {
    const raw = Arr.find(weighted.list(), function (d) {
      return w <= d.accWeight;
    });

    const keys = raw.map(Obj.keys).getOr([]) as any[];
    return keys.length === ['weight', 'accWeight'].length ? Option.none() : raw;
  });
};

const generator = function <T extends WeightedItem>(candidates: T[]) {
  const list = choose(candidates);
  return gChoose(list);
};

export const WeightedChoice = {
  generator
};
