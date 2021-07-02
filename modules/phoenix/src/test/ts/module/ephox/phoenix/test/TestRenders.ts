import { Gene } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';

import { TypedItem } from 'ephox/phoenix/api/data/TypedItem';

const typeditem = (a: TypedItem<Gene, undefined>): string => {
  return a.fold((item) => {
    return 'boundary(' + item.id + ')';
  }, (item) => {
    return 'empty(' + item.id + ')';
  }, (item) => {
    return 'text("' + item.text + '")';
  }, (item) => {
    return 'text("' + item.text + '")';
  });
};

const typeditems = (items: TypedItem<Gene, undefined>[]): string[] => {
  return Arr.map(items, typeditem);
};

const ids = (items: Gene[]): string[] => {
  return Arr.map(items, id);
};

const id = (item: Gene): string => {
  return item.id;
};

const texts = (items: Gene[]): string[] => {
  return Arr.map(items, text);
};

const text = (item: Gene): string => {
  return Optional.from(item.text).getOr('');
};

export {
  typeditem,
  typeditems,
  ids,
  id,
  texts,
  text
};
