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

const before = adt.before;
const on = adt.on;
const after = adt.after;

export default {
  before,
  on,
  after,
  cata,
  getStart,
};