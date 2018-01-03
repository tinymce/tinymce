import { Resolve } from '@ephox/katamari';

var unsafe = function (name, scope) {
  return Resolve.resolve(name, scope);
};

var getOrDie = function (name, scope) {
  var actual = unsafe(name, scope);

  if (actual === undefined || actual === null) throw name + ' not available on this browser';
  return actual;
};

export default <any> {
  getOrDie: getOrDie
};