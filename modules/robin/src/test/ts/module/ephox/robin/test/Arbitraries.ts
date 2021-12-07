import { Gene, TestUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import * as fc from 'fast-check';

export interface ArbTextIds {
  readonly startId: string;
  readonly textIds: string[];
}

export interface ArbIds {
  readonly startId: string;
  readonly ids: string[];
}

export interface ArbRangeIds {
  readonly startId: string;
  readonly finishId: string;
  readonly ids: string[];
}

const getIds = (item: Gene, predicate: (g: Gene) => boolean): string[] => {
  const rest = Arr.bind(item.children || [], (id) => {
    return getIds(id, predicate);
  });
  const self = predicate(item) && item.id !== 'root' ? [ item.id ] : [];
  return self.concat(rest);
};

const textIds = (universe: TestUniverse) => {
  return getIds(universe.get(), universe.property().isText);
};

const arbTextIds = (universe: TestUniverse): fc.Arbitrary<ArbTextIds> => {
  const ids = textIds(universe);
  return fc.constantFrom(...textIds(universe)).map((id) => ({
    startId: id,
    textIds: ids
  }));
};

const arbIds = (universe: TestUniverse, predicate: (g: Gene) => boolean): fc.Arbitrary<ArbIds> => {
  const ids = getIds(universe.get(), predicate);

  return fc.constantFrom(...ids).map((id) => ({
    startId: id,
    ids
  }));
};

const arbRangeIds = (universe: TestUniverse, predicate: (g: Gene) => boolean): fc.Arbitrary<ArbRangeIds> => {
  const ids = getIds(universe.get(), predicate);

  return fc.integer({ min: 0, max: ids.length - 1 }).chain((startIndex) =>
    fc.integer({ min: startIndex, max: ids.length - 1 }).map((finishIndex) => ({
      startId: ids[startIndex],
      finishId: ids[finishIndex],
      ids
    }))
  );
};

export { arbTextIds, arbRangeIds, arbIds };
