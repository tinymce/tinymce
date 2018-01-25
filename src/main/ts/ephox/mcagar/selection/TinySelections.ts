import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { Traverse } from '@ephox/sugar';

var toDomRange = function (range) {
  var doc = Traverse.owner(range.start());
  var rng = doc.dom().createRange();
  rng.setStart(range.start().dom(), range.soffset());
  rng.setEnd(range.finish().dom(), range.foffset());
  return rng;
};

var createDomSelection = function (container, sPath: number[], soffset: number, fPath: number[], foffset: number) {
  var path = Cursors.path({
    startPath: sPath,
    soffset: soffset,
    finishPath: fPath,
    foffset: foffset
  });
  return toDomRange(Cursors.calculate(container, path));
};

var createDomCursor = function (container, elementPath: number[], offset: number) {
  var elm = Cursors.calculateOne(container, elementPath);
  return toDomRange(Cursors.range({
    start: elm,
    soffset: offset,
    finish: elm,
    foffset: offset
  }));
};

var createDomSelectionOf = function (container, start, soffset: number, finish, foffset: number) {
  return toDomRange(Cursors.range({
    start: start,
    soffset: soffset,
    finish: finish,
    foffset: foffset
  }));
};

var cCreateDomSelection = function (sPath: number[], soffset: number, fPath: number[], foffset: number) {
  return Chain.mapper(function (container) {
    return createDomSelection(container, sPath, soffset, fPath, foffset);
  });
};

var cCreateDomCursor = function (elementPath: number[], offset: number) {
  return Chain.mapper(function (container) {
    return createDomCursor(container, elementPath, offset);
  });
};

var cCreateDomSelectionOf = function (start, soffset: number, finish, foffset: number) {
  return Chain.mapper(function (container) {
    return createDomSelectionOf(container, start, soffset, finish, foffset);
  });
};

export default {
  createDomSelection: createDomSelection,
  createDomCursor: createDomCursor,
  createDomSelectionOf: createDomSelectionOf,

  cCreateDomSelection: cCreateDomSelection,
  cCreateDomCursor: cCreateDomCursor,
  cCreateDomSelectionOf: cCreateDomSelectionOf
};