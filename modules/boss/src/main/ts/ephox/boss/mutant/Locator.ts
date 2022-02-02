import { Arr, Optional } from '@ephox/katamari';

import { Gene } from '../api/Gene';
import * as Comparator from './Comparator';
import * as Creator from './Creator';

const byId = (item: Gene, id: string): Optional<Gene> => {
  if (id === undefined) {
    throw new Error('Id value not specified for byId');
  }
  if (item.id !== undefined && item.id === id) {
    return Optional.some(item);
  } else {
    return Arr.foldl(item.children || [], (b, a) => {
      return byId(a, id).or(b);
    }, Optional.none<Gene>());
  }
};

const byItem = (item: Gene, target: Gene): Optional<Gene> => {
  const itemNu = Creator.isNu(item);
  const targetNu = Creator.isNu(target);
  const sameId = item.id !== undefined && item.id === target.id;
  if (sameId && !itemNu && !targetNu) {
    return Optional.some(item);
  } else if (sameId && itemNu && targetNu && item.random === target.random) {
    return Optional.some(item);
  } else {
    return Arr.foldl(item.children || [], (b, a) => {
      return byItem(a, target).or(b);
    }, Optional.none());
  }
};

const indexIn = (parent: Gene, item: Gene): Optional<number> => {
  return Arr.findIndex(parent.children, (x) => {
    return Comparator.eq(x, item);
  });
};

export {
  byId,
  byItem,
  indexIn
};
