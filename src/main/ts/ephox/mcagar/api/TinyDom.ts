import { Struct } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

var range = Struct.immutableBag([ 'start', 'soffset', 'finish', 'foffset' ], [ ]);

var fromDom = function (elm) {
  return Element.fromDom(elm);
};

var fromRange = function (rng) {
  return range({
    start: rng.startContainer,
    soffset: rng.startOffset,
    finish: rng.endContainer,
    foffset: rng.endOffset
  });
};

export default {
  fromDom: fromDom,
  fromRange: fromRange
};