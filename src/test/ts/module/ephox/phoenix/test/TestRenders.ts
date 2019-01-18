import { Arr } from '@ephox/katamari';

var typeditem = function (a) {
  return a.fold(function (item) {
    return 'boundary(' + item.id + ')';
  }, function (item) {
    return 'empty(' + item.id + ')';
  }, function (item) {
    return 'text("' + item.text + '")';
  });
};

var typeditems = function (items) {
  return Arr.map(items, typeditem);
};

var ids = function (items) {
  return Arr.map(items, id);
};

var id = function (item) {
  return item.id;
};

var texts = function (items) {
  return Arr.map(items, text);
};

var text = function (item) {
  return item.text;
};

export default {
  typeditem: typeditem,
  typeditems: typeditems,
  ids: ids,
  id: id,
  texts: texts,
  text: text
};