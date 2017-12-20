import { Arr } from '@ephox/katamari';
import Attr from './Attr';

// Methods for handling attributes that contain a list of values <div foo="alpha beta theta">
var read = function (element, attr) {
  var value = Attr.get(element, attr);
  return value === undefined || value === '' ? [] : value.split(' ');
};

var add = function (element, attr, id) {
  var old = read(element, attr);
  var nu = old.concat([id]);
  Attr.set(element, attr, nu.join(' '));
};

var remove = function (element, attr, id) {
  var nu = Arr.filter(read(element, attr), function (v) {
    return v !== id;
  });
  if (nu.length > 0) Attr.set(element, attr, nu.join(' '));
  else Attr.remove(element, attr);
};

export default <any> {
  read: read,
  add: add,
  remove: remove
};