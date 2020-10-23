import { Arr, Optional } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import * as Comparator from './Comparator';
import * as Creator from './Creator';

const byId = function (item: Gene, id: string): Optional<Gene> {
  if (id === undefined) {
    throw new Error('Id value not specified for byId');
  }
  if (item.id !== undefined && item.id === id) {
    return Optional.some(item);
  } else {
    return Arr.foldl(item.children || [], function (b, a) {
      return byId(a, id).or(b);
    }, Optional.none<Gene>());
  }
};

const byItem = function (item: Gene, target: Gene): Optional<Gene> {
  const itemNu = Creator.isNu(item);
  const targetNu = Creator.isNu(target);
  const sameId = item.id !== undefined && item.id === target.id;
  if (sameId && !itemNu && !targetNu) {
    return Optional.some(item);
  } else if (sameId && itemNu && targetNu && item.random === target.random) {
    return Optional.some(item);
  } else {
    return Arr.foldl(item.children || [], function (b, a) {
      return byItem(a, target).or(b);
    }, Optional.none());
  }
};

const indexIn = function (parent: Gene, item: Gene) {
  return Arr.findIndex(parent.children, function (x) {
    return Comparator.eq(x, item);
  });
};

export {
  byId,
  byItem,
  indexIn
};
