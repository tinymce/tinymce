import { Gene } from '@ephox/boss';
import { Arr, Option } from '@ephox/katamari';
import { TypedItem } from 'ephox/phoenix/api/Main';

const typeditem = function (a: TypedItem<Gene, undefined>) {
  return a.fold(function (item) {
    return 'boundary(' + item.id + ')';
  }, function (item) {
    return 'empty(' + item.id + ')';
  }, function (item) {
    return 'text("' + item.text + '")';
  });
};

const typeditems = function (items: TypedItem<Gene, undefined>[]) {
  return Arr.map(items, typeditem);
};

const ids = function (items: Gene[]) {
  return Arr.map(items, id);
};

const id = function (item: Gene) {
  return item.id;
};

const texts = function (items: Gene[]) {
  return Arr.map(items, text);
};

const text = function (item: Gene) {
  return Option.from(item.text).getOr('');
};

export {
  typeditem,
  typeditems,
  ids,
  id,
  texts,
  text
};