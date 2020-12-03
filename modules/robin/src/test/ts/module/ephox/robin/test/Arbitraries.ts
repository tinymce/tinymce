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

const getIds = function (item: Gene, predicate: (g: Gene) => boolean): string[] {
  const rest = Arr.bind(item.children || [], function (id) { return getIds(id, predicate); });
  const self = predicate(item) && item.id !== 'root' ? [ item.id ] : [];
  return self.concat(rest);
};

const textIds = function (universe: TestUniverse) {
  return getIds(universe.get(), universe.property().isText);
};

const arbTextIds = function (universe: TestUniverse) {
  const ids = textIds(universe);
  return Jsc.elements(textIds(universe)).smap(function (id: string): ArbTextIds {
    return {
      startId: id,
      textIds: ids
    };
  }, function (obj: ArbTextIds) {
    return obj.startId;
  });
};

const arbIds = function (universe: TestUniverse, predicate: (g: Gene) => boolean) {
  const ids = getIds(universe.get(), predicate);

  return Jsc.elements(ids).smap(function (id: string): ArbIds {
    return {
      startId: id,
      ids
    };
  }, function (obj: ArbIds) {
    return obj.startId;
  }, function (obj: ArbIds) {
    return '[id :: ' + obj.startId + ']';
  });
};

const arbRangeIds = function (universe: TestUniverse, predicate: (g: Gene) => boolean) {
  const ids = getIds(universe.get(), predicate);

  const generator = Jsc.integer(0, ids.length - 1).generator.flatMap(function (startIndex: number) {
    return Jsc.integer(startIndex, ids.length - 1).generator.map(function (finishIndex: number): ArbRangeIds {
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
