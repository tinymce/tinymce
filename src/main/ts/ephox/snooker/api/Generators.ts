import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Cell } from '@ephox/katamari';
import { Contracts } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';

var elementToData = function (element) {
  var colspan = Attr.has(element, 'colspan') ? parseInt(Attr.get(element, 'colspan'), 10) : 1;
  var rowspan = Attr.has(element, 'rowspan') ? parseInt(Attr.get(element, 'rowspan'), 10) : 1;
  return {
    element: Fun.constant(element),
    colspan: Fun.constant(colspan),
    rowspan: Fun.constant(rowspan)
  };
};

var modification = function (generators, _toData) {
  contract(generators);
  var position = Cell(Option.none());
  var toData = _toData !== undefined ? _toData : elementToData;

  var nu = function (data) {
    return generators.cell(data);
  };

  var nuFrom = function (element) {
    var data = toData(element);
    return nu(data);
  };

  var add = function (element) {
    var replacement = nuFrom(element);
    if (position.get().isNone()) position.set(Option.some(replacement));
    recent = Option.some({ item: element, replacement: replacement });
    return replacement;
  };

  var recent = Option.none();
  var getOrInit = function (element, comparator) {
    return recent.fold(function () {
      return add(element);
    }, function (p) {
      return comparator(element, p.item) ? p.replacement : add(element);
    });
  };

  return {
    getOrInit: getOrInit,
    cursor: position.get
  } ;
};

var transform = function (scope, tag) {
  return function (generators) {
    var position = Cell(Option.none());
    contract(generators);
    var list = [];

    var find = function (element, comparator) {
      return Arr.find(list, function (x) { return comparator(x.item, element); });
    };

    var makeNew = function (element) {
      var cell = generators.replace(element, tag, {
        scope: scope
      });
      list.push({ item: element, sub: cell });
      if (position.get().isNone()) position.set(Option.some(cell));
      return cell;
    };

    var replaceOrInit = function (element, comparator) {
      return find(element, comparator).fold(function () {
        return makeNew(element);
      }, function (p) {
        return comparator(element, p.item) ? p.sub : makeNew(element);
      });
    };

    return {
      replaceOrInit: replaceOrInit,
      cursor: position.get
    };
  };
};

var merging = function (generators) {
  contract(generators);
  var position = Cell(Option.none());

  var combine = function (cell) {
    if (position.get().isNone()) position.set(Option.some(cell));
    return function () {
      var raw = generators.cell({
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
    combine: combine,
    cursor: position.get
  };
};

var contract = Contracts.exactly([ 'cell', 'row', 'replace', 'gap' ]);

export default {
  modification: modification,
  transform: transform,
  merging: merging
};