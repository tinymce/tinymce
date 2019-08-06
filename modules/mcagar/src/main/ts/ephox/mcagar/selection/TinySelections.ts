import { Chain, Cursors} from '@ephox/agar';
import { Traverse } from '@ephox/sugar';

const toDomRange = function (range) {
  const doc = Traverse.owner(range.start());
  const rng = doc.dom().createRange();
  rng.setStart(range.start().dom(), range.soffset());
  rng.setEnd(range.finish().dom(), range.foffset());
  return rng;
};

const createDomSelection = function (container, sPath: number[], soffset: number, fPath: number[], foffset: number) {
  const path = Cursors.path({
    startPath: sPath,
    soffset,
    finishPath: fPath,
    foffset
  });
  return toDomRange(Cursors.calculate(container, path));
};

const createDomCursor = function (container, elementPath: number[], offset: number) {
  const elm = Cursors.calculateOne(container, elementPath);
  return toDomRange(Cursors.range({
    start: elm,
    soffset: offset,
    finish: elm,
    foffset: offset
  }));
};

const createDomSelectionOf = function (container, start, soffset: number, finish, foffset: number) {
  return toDomRange(Cursors.range({
    start,
    soffset,
    finish,
    foffset
  }));
};

const cCreateDomSelection = function (sPath: number[], soffset: number, fPath: number[], foffset: number) {
  return Chain.mapper(function (container) {
    return createDomSelection(container, sPath, soffset, fPath, foffset);
  });
};

const cCreateDomCursor = function (elementPath: number[], offset: number) {
  return Chain.mapper(function (container) {
    return createDomCursor(container, elementPath, offset);
  });
};

const cCreateDomSelectionOf = function (start, soffset: number, finish, foffset: number) {
  return Chain.mapper(function (container) {
    return createDomSelectionOf(container, start, soffset, finish, foffset);
  });
};

export default {
  createDomSelection,
  createDomCursor,
  createDomSelectionOf,

  cCreateDomSelection,
  cCreateDomCursor,
  cCreateDomSelectionOf
};
