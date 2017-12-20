import { Adt } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import Element from '../node/Element';
import Traverse from '../search/Traverse';
import Situ from './Situ';

// Consider adding a type for "element"
var type = Adt.generate([
  { domRange: [ 'rng' ] },
  { relative: [ 'startSitu', 'finishSitu' ] },
  { exact: [ 'start', 'soffset', 'finish', 'foffset' ] }
]);

var range = Struct.immutable(
  'start',
  'soffset',
  'finish',
  'foffset'
);

var exactFromRange = function (simRange) {
  return type.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
};

var getStart = function (selection) {
  return selection.match({
    domRange: function (rng) {
      return Element.fromDom(rng.startContainer);
    },
    relative: function (startSitu, finishSitu) {
      return Situ.getStart(startSitu);
    },
    exact: function (start, soffset, finish, foffset) {
      return start;
    }
  });
};

var getWin = function (selection) {
  var start = getStart(selection);

  return Traverse.defaultView(start);
};

export default <any> {
  domRange: type.domRange,
  relative: type.relative,
  exact: type.exact,

  exactFromRange: exactFromRange,
  range: range,

  getWin: getWin
};