import { Arr } from '@ephox/katamari';

import { SugarElement } from '../../api/node/SugarElement';
import * as SugarNode from '../../api/node/SugarNode';
import { SimSelection } from '../../api/selection/SimSelection';
import { Situ } from '../../api/selection/Situ';

const beforeSpecial = (element: SugarElement<Node>, offset: number): Situ => {
  // From memory, we don't want to use <br> directly on Firefox because it locks the keyboard input.
  // It turns out that <img> directly on IE locks the keyboard as well.
  // If the offset is 0, use before. If the offset is 1, use after.
  // TBIO-3889: Firefox Situ.on <input> results in a child of the <input>; Situ.before <input> results in platform inconsistencies
  const name = SugarNode.name(element);
  if ('input' === name) {
    return Situ.after(element);
  } else if (!Arr.contains([ 'br', 'img' ], name)) {
    return Situ.on(element, offset);
  } else {
    return offset === 0 ? Situ.before(element) : Situ.after(element);
  }
};

const preprocessRelative = (startSitu: Situ, finishSitu: Situ): SimSelection => {
  const start = startSitu.fold(Situ.before, beforeSpecial, Situ.after);
  const finish = finishSitu.fold(Situ.before, beforeSpecial, Situ.after);
  return SimSelection.relative(start, finish);
};

const preprocessExact = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number): SimSelection => {
  const startSitu = beforeSpecial(start, soffset);
  const finishSitu = beforeSpecial(finish, foffset);
  return SimSelection.relative(startSitu, finishSitu);
};

const preprocess = (selection: SimSelection): SimSelection => selection.match({
  domRange: (rng) => {
    const start = SugarElement.fromDom(rng.startContainer);
    const finish = SugarElement.fromDom(rng.endContainer);
    return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
  },
  relative: preprocessRelative,
  exact: preprocessExact
});

export {
  beforeSpecial,
  preprocess,
  preprocessRelative,
  preprocessExact
};
