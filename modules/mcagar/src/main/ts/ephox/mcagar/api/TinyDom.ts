import { Struct } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

const range = Struct.immutableBag([ 'start', 'soffset', 'finish', 'foffset' ], [ ]);

const fromDom = function (elm) {
  return Element.fromDom(elm);
};

const fromRange = function (rng) {
  return range({
    start: rng.startContainer,
    soffset: rng.startOffset,
    finish: rng.endContainer,
    foffset: rng.endOffset
  });
};

export default {
  fromDom,
  fromRange
};
