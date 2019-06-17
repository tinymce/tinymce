import { Arr } from '@ephox/katamari';
import Element from '../../api/node/Element';
import * as Node from '../../api/node/Node';
import { Selection } from '../../api/selection/Selection';
import { Situ } from '../../api/selection/Situ';

const beforeSpecial = function (element: Element, offset: number) {
  // From memory, we don't want to use <br> directly on Firefox because it locks the keyboard input.
  // It turns out that <img> directly on IE locks the keyboard as well.
  // If the offset is 0, use before. If the offset is 1, use after.
  // TBIO-3889: Firefox Situ.on <input> results in a child of the <input>; Situ.before <input> results in platform inconsistencies
  const name = Node.name(element);
  if ('input' === name) {
    return Situ.after(element);
  } else if (!Arr.contains(['br', 'img'], name)) {
    return Situ.on(element, offset);
  } else {
    return offset === 0 ? Situ.before(element) : Situ.after(element);
  }
};

const preprocessRelative = function (startSitu: Situ, finishSitu: Situ) {
  const start = startSitu.fold(Situ.before, beforeSpecial, Situ.after);
  const finish = finishSitu.fold(Situ.before, beforeSpecial, Situ.after);
  return Selection.relative(start, finish);
};

const preprocessExact = function (start: Element, soffset: number, finish: Element, foffset: number) {
  const startSitu = beforeSpecial(start, soffset);
  const finishSitu = beforeSpecial(finish, foffset);
  return Selection.relative(startSitu, finishSitu);
};

const preprocess = function (selection: Selection) {
  return selection.match({
    domRange(rng) {
      const start = Element.fromDom(rng.startContainer);
      const finish = Element.fromDom(rng.endContainer);
      return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
    },
    relative: preprocessRelative,
    exact: preprocessExact
  });
};

export {
  beforeSpecial,
  preprocess,
  preprocessRelative,
  preprocessExact,
};