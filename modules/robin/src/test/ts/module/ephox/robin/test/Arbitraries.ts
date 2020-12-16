import { Gene, TestUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

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

const arbTextIds = (universe: TestUniverse) => {
  const ids = textIds(universe);
  return Jsc.elements(textIds(universe)).smap((id: string): ArbTextIds => {
    return {
      startId: id,
      textIds: ids
    };
  }, (obj: ArbTextIds) => {
    return obj.startId;
  });
};

const arbIds = (universe: TestUniverse, predicate: (g: Gene) => boolean) => {
  const ids = getIds(universe.get(), predicate);

  return Jsc.elements(ids).smap((id: string): ArbIds => {
    return {
      startId: id,
      ids
    };
  }, (obj: ArbIds) => {
    return obj.startId;
  }, (obj: ArbIds) => {
    return '[id :: ' + obj.startId + ']';
  });
};

const arbRangeIds = (universe: TestUniverse, predicate: (g: Gene) => boolean) => {
  const ids = getIds(universe.get(), predicate);

  const generator = Jsc.integer(0, ids.length - 1).generator.flatMap((startIndex: number) => {
    return Jsc.integer(startIndex, ids.length - 1).generator.map((finishIndex: number): ArbRangeIds => {
      return {
        startId: ids[startIndex],
        finishId: ids[finishIndex],
        ids
      };
    });
  });

  return Jsc.bless({
    generator
  });
};

export { arbTextIds, arbRangeIds, arbIds };
