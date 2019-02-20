import { Arr, Option } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import Comparator from './Comparator';
import Creator from './Creator';

const byId = function (item: Gene, id: string): Option<Gene> {
  if (id === undefined) throw 'Id value not specified for byId: ' + id;
  if (item.id !== undefined && item.id === id) {
    return Option.some(item);
  } else {
    return Arr.foldl(item.children || [], function (b, a) {
      return byId(a, id).or(b);
    }, Option.none<Gene>());
  }
};

const byItem = function (item: Gene, target: Gene): Option<Gene> {
  const itemNu = Creator.isNu(item);
  const targetNu = Creator.isNu(target);
  const sameId = item.id !== undefined && item.id === target.id;
  if (sameId && !itemNu && !targetNu) {
    return Option.some(item);
  } else if (sameId && itemNu && targetNu && item.random === target.random) {
    return Option.some(item);
  } else {
    return Arr.foldl(item.children || [], function (b, a) {
      return byItem(a, target).or(b);
    }, Option.none());
  }
};

const indexIn = function (parent: Gene, item: Gene) {
  return Arr.findIndex(parent.children, function (x) {
    return Comparator.eq(x, item);
  });
};

export default {
  byId,
  byItem,
  indexIn
};