import { Merger } from '@ephox/katamari';

var set = function (item, property, value) {
  var r = {};
  r[property] = value;
  item.attrs = Merger.merge(item.attrs !== undefined ? item.attrs : {}, r);
};

var get = function (item, property) {
  return item.attrs[property];
};

var remove = function (item, property) {
  var rest = Merger.merge({}, item.attrs);
  delete rest[property];
  item.attrs = rest;
};

var copyTo = function (source, destination) {
  var sourceAttrs = source.attrs !== undefined ? source.attrs : {};
  var destAttrs = destination.attrs !== undefined ? destination.attrs : {};
  destination.attrs = Merger.merge(destAttrs, sourceAttrs);
};

export default <any> {
  get: get,
  set: set,
  remove: remove,
  copyTo: copyTo
};