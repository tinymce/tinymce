import { Adt } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';

var adt = Adt.generate([
  { 'before': [ 'element' ] },
  { 'on': [ 'element', 'offset' ] },
  { after: [ 'element' ] }
]);

// Probably don't need this given that we now have "match"
var cata = function (subject, onBefore, onOn, onAfter) {
  return subject.fold(onBefore, onOn, onAfter);
};

var getStart = function (situ) {
  return situ.fold(Fun.identity, Fun.identity, Fun.identity)
};

export default {
  before: adt.before,
  on: adt.on,
  after: adt.after,
  cata,
  getStart,
};