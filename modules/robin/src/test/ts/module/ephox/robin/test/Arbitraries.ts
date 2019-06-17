import { Gene, TestUniverse } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

const getIds = function (item: Gene, predicate: (g: Gene) => boolean): string[] {
  const rest = Arr.bind(item.children || [], function (id) { return getIds(id, predicate); });
  const self = predicate(item) && item.id !== 'root' ? [item.id] : [];
  return self.concat(rest);
};

const textIds = function (universe: TestUniverse) {
  return getIds(universe.get(), universe.property().isText);
};

export interface ArbTextIds {
  startId: string;
  textIds: string[];
}

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

export interface ArbIds {
  startId: string;
  ids: string[];
}

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

export interface ArbRangeIds {
  startId: string;
  finishId: string;
  ids: string[];
}

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
