import { Arr, Cell, Contracts, Fun, Option } from '@ephox/katamari';
import { Attr, Css } from '@ephox/sugar';

const elementToData = function (element) {
  const colspan = Attr.has(element, 'colspan') ? parseInt(Attr.get(element, 'colspan'), 10) : 1;
  const rowspan = Attr.has(element, 'rowspan') ? parseInt(Attr.get(element, 'rowspan'), 10) : 1;
  return {
    element: Fun.constant(element),
    colspan: Fun.constant(colspan),
    rowspan: Fun.constant(rowspan)
  };
};

const modification = function (generators, _toData) {
  contract(generators);
  const position = Cell(Option.none());
  const toData = _toData !== undefined ? _toData : elementToData;

  const nu = function (data) {
    return generators.cell(data);
  };

  const nuFrom = function (element) {
    const data = toData(element);
    return nu(data);
  };

  const add = function (element) {
    const replacement = nuFrom(element);
    if (position.get().isNone()) { position.set(Option.some(replacement)); }
    recent = Option.some({ item: element, replacement });
    return replacement;
  };

  let recent = Option.none();
  const getOrInit = function (element, comparator) {
    return recent.fold(function () {
      return add(element);
    }, function (p) {
      return comparator(element, p.item) ? p.replacement : add(element);
    });
  };

  return {
    getOrInit,
    cursor: position.get
  } ;
};

const transform = function (scope, tag) {
  return function (generators) {
    const position = Cell(Option.none());
    contract(generators);
    const list = [];

    const find = function (element, comparator) {
      return Arr.find(list, function (x) { return comparator(x.item, element); });
    };

    const makeNew = function (element) {
      const cell = generators.replace(element, tag, {
        scope
      });
      list.push({ item: element, sub: cell });
      if (position.get().isNone()) { position.set(Option.some(cell)); }
      return cell;
    };

    const replaceOrInit = function (element, comparator) {
      return find(element, comparator).fold(function () {
        return makeNew(element);
      }, function (p) {
        return comparator(element, p.item) ? p.sub : makeNew(element);
      });
    };

    return {
      replaceOrInit,
      cursor: position.get
    };
  };
};

const merging = function (generators) {
  contract(generators);
  const position = Cell(Option.none());

  const combine = function (cell) {
    if (position.get().isNone()) { position.set(Option.some(cell)); }
    return function () {
      const raw = generators.cell({
        element: Fun.constant(cell),
        colspan: Fun.constant(1),
        rowspan: Fun.constant(1)
      });
      // Remove any width calculations because they are no longer relevant.
      Css.remove(raw, 'width');
      Css.remove(cell, 'width');
      return raw;
    };
  };

  return {
    combine,
    cursor: position.get
  };
};

const contract = Contracts.exactly([ 'cell', 'row', 'replace', 'gap' ]);

export default {
  modification,
  transform,
  merging
};