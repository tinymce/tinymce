import * as fc from 'fast-check';

import * as WeightedChoice from './WeightedChoice';

export interface Decorator<T> extends WeightedChoice.WeightedItem {
  property: string;
  value: fc.Arbitrary<T>;
}

const gOne = <T>(wDecorations: Decorator<T>[]): fc.Arbitrary<Record<string, T>> =>
  WeightedChoice.generator(wDecorations).chain((choice) =>
    choice.fold(() =>
      fc.constant({}),
    (c) => c.value.map((v) => {
      const r = {};
      r[c.property] = v;
      return r;
    })));

const gEnforce = <T>(decorations: T): fc.Arbitrary<T> =>
  fc.constant(decorations);

export {
  gOne,
  gEnforce
};
