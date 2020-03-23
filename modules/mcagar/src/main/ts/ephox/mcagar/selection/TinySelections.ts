import { Chain, Cursors } from '@ephox/agar';
import { Element, SimRange, Traverse } from '@ephox/sugar';

const toDomRange = function (range: SimRange) {
  const doc = Traverse.owner(range.start());
  const rng = doc.dom().createRange();
  rng.setStart(range.start().dom(), range.soffset());
  rng.setEnd(range.finish().dom(), range.foffset());
  return rng;
};

const createDomSelection = function (container: Element, sPath: number[], soffset: number, fPath: number[], foffset: number) {
  const path = Cursors.path({
    startPath: sPath,
    soffset,
    finishPath: fPath,
    foffset
  });
  return toDomRange(Cursors.calculate(container, path));
};

const createDomCursor = function (container: Element, elementPath: number[], offset: number) {
  const elm = Cursors.calculateOne(container, elementPath);
  return toDomRange(Cursors.range({
    start: elm,
    soffset: offset,
    finish: elm,
    foffset: offset
  }));
};

const createDomSelectionOf = function (container: Element, start: Element, soffset: number, finish: Element, foffset: number) {
  return toDomRange(Cursors.range({
    start,
    soffset,
    finish,
    foffset
  }));
};

const cCreateDomSelection = function (sPath: number[], soffset: number, fPath: number[], foffset: number) {
  return Chain.mapper(function (container: Element) {
    return createDomSelection(container, sPath, soffset, fPath, foffset);
  });
};

const cCreateDomCursor = function (elementPath: number[], offset: number) {
  return Chain.mapper(function (container: Element) {
    return createDomCursor(container, elementPath, offset);
  });
};

const cCreateDomSelectionOf = function (start: Element, soffset: number, finish: Element, foffset: number) {
  return Chain.mapper(function (container: Element) {
    return createDomSelectionOf(container, start, soffset, finish, foffset);
  });
};

export {
  createDomSelection,
  createDomCursor,
  createDomSelectionOf,

  cCreateDomSelection,
  cCreateDomCursor,
  cCreateDomSelectionOf
};
