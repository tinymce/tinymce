import { Chain, Cursors } from '@ephox/agar';
import { SimRange, SugarElement, Traverse } from '@ephox/sugar';

const toDomRange = function (range: SimRange): Range {
  const doc = Traverse.owner(range.start);
  const rng = doc.dom.createRange();
  rng.setStart(range.start.dom, range.soffset);
  rng.setEnd(range.finish.dom, range.foffset);
  return rng;
};

const createDomSelection = function (container: SugarElement, sPath: number[], soffset: number, fPath: number[], foffset: number): Range {
  const path = Cursors.path({
    startPath: sPath,
    soffset,
    finishPath: fPath,
    foffset
  });
  return toDomRange(Cursors.calculate(container, path));
};

const createDomCursor = function (container: SugarElement, elementPath: number[], offset: number): Range {
  const elm = Cursors.calculateOne(container, elementPath);
  return toDomRange(Cursors.range({
    start: elm,
    soffset: offset,
    finish: elm,
    foffset: offset
  }));
};

const createDomSelectionOf = function (container: SugarElement, start: SugarElement, soffset: number, finish: SugarElement, foffset: number): Range {
  return toDomRange(Cursors.range({
    start,
    soffset,
    finish,
    foffset
  }));
};

const cCreateDomSelection = function (sPath: number[], soffset: number, fPath: number[], foffset: number): Chain<SugarElement, Range> {
  return Chain.mapper((container) => {
    return createDomSelection(container, sPath, soffset, fPath, foffset);
  });
};

const cCreateDomCursor = function (elementPath: number[], offset: number): Chain<SugarElement, Range> {
  return Chain.mapper((container) => {
    return createDomCursor(container, elementPath, offset);
  });
};

const cCreateDomSelectionOf = function (start: SugarElement, soffset: number, finish: SugarElement, foffset: number): Chain<SugarElement, Range> {
  return Chain.mapper((container) => {
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
