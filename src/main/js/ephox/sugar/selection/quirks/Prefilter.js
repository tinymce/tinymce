import { Arr } from '@ephox/katamari';
import Element from '../../api/node/Element';
import Node from '../../api/node/Node';
import Selection from '../../api/selection/Selection';
import Situ from '../../api/selection/Situ';

var beforeSpecial = function (element, offset) {
  // From memory, we don't want to use <br> directly on Firefox because it locks the keyboard input.
  // It turns out that <img> directly on IE locks the keyboard as well.
  // If the offset is 0, use before. If the offset is 1, use after.
  // TBIO-3889: Firefox Situ.on <input> results in a child of the <input>; Situ.before <input> results in platform inconsistencies
  var name = Node.name(element);
  if ('input' === name) return Situ.after(element);
  else if (!Arr.contains([ 'br', 'img' ], name)) return Situ.on(element, offset);
  else return offset === 0 ? Situ.before(element) : Situ.after(element);
};

var preprocessRelative = function (startSitu, finishSitu) {
  var start = startSitu.fold(Situ.before, beforeSpecial, Situ.after);
  var finish = finishSitu.fold(Situ.before, beforeSpecial, Situ.after);
  return Selection.relative(start, finish);
};

var preprocessExact = function (start, soffset, finish, foffset) {
  var startSitu = beforeSpecial(start, soffset);
  var finishSitu = beforeSpecial(finish, foffset);
  return Selection.relative(startSitu, finishSitu);
};

var preprocess = function (selection) {
  return selection.match({
    domRange: function (rng) {
      var start = Element.fromDom(rng.startContainer);
      var finish = Element.fromDom(rng.endContainer);
      return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
    },
    relative: preprocessRelative,
    exact: preprocessExact
  });
};

export default <any> {
  beforeSpecial: beforeSpecial,
  preprocess: preprocess,
  preprocessRelative: preprocessRelative,
  preprocessExact: preprocessExact
};