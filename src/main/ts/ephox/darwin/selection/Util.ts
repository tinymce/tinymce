import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Situ } from '@ephox/sugar';
import { SelectionDirection } from '@ephox/sugar';

var convertToRange = function (win, selection) {
  // TODO: Use API packages of sugar
  var rng = SelectionDirection.asLtrRange(win, selection);
  return {
    start: Fun.constant(Element.fromDom(rng.startContainer)),
    soffset: Fun.constant(rng.startOffset),
    finish: Fun.constant(Element.fromDom(rng.endContainer)),
    foffset: Fun.constant(rng.endOffset)
  };
};

var makeSitus = function (start, soffset, finish, foffset) {
  return {
    start: Fun.constant(Situ.on(start, soffset)),
    finish: Fun.constant(Situ.on(finish, foffset))
  };
};

export default <any> {
  convertToRange: convertToRange,
  makeSitus: makeSitus
};