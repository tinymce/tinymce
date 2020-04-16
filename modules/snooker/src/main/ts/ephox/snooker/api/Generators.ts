import { HTMLElementTagNameMap } from '@ephox/dom-globals';
import { Arr, Cell, Contracts, Fun, Option } from '@ephox/katamari';
import { Css, Element } from '@ephox/sugar';
import { getAttrValue } from '../util/CellUtils';

export interface CellSpan {
  readonly element: () => Element;
  readonly colspan: () => number;
  readonly rowspan: () => number;
}

export interface Generators {
  readonly cell: (cellSpan: CellSpan) => Element;
  readonly row: () => Element;
  readonly replace: <K extends keyof HTMLElementTagNameMap>(cell: Element, tag: K, attrs: Record<string, string | number | boolean | null>) => Element;
  readonly gap: () => Element;
}

export interface SimpleGenerators extends Generators {
  readonly cell: () => Element;
  readonly row: () => Element;
  readonly replace: (cell: Element) => Element;
  readonly gap: () => Element;
}

export interface GeneratorsWrapper {
  readonly cursor: () => Option<Element>;
}

export interface GeneratorsModification extends GeneratorsWrapper {
  readonly getOrInit: (element: Element, comparator: (a: Element, b: Element) => boolean) => Element;
}

export interface GeneratorsTransform extends GeneratorsWrapper {
  readonly replaceOrInit: (element: Element, comparator: (a: Element, b: Element) => boolean) => Element;
}

export interface GeneratorsMerging extends GeneratorsWrapper {
  readonly combine: (cell: Element) => () => Element;
}

interface Recent {
  readonly item: Element;
  readonly replacement: Element;
}

interface Item {
  readonly item: Element;
  readonly sub: Element;
}

const verifyGenerators: (gen: Generators) => Generators = Contracts.exactly([ 'cell', 'row', 'replace', 'gap' ]);

const elementToData = function (element: Element): CellSpan {
  const colspan = getAttrValue(element, 'colspan', 1);
  const rowspan = getAttrValue(element, 'rowspan', 1);
  return {
    element: Fun.constant(element),
    colspan: Fun.constant(colspan),
    rowspan: Fun.constant(rowspan)
  };
};

// note that `toData` seems to be only for testing
const modification = function (generators: Generators, toData = elementToData): GeneratorsModification {
  verifyGenerators(generators);
  const position = Cell(Option.none<Element>());

  const nu = function (data: CellSpan) {
    return generators.cell(data);
  };

  const nuFrom = function (element: Element) {
    const data = toData(element);
    return nu(data);
  };

  const add = function (element: Element) {
    const replacement = nuFrom(element);
    if (position.get().isNone()) {
      position.set(Option.some(replacement));
    }
    recent = Option.some({ item: element, replacement });
    return replacement;
  };

  let recent = Option.none<Recent>();
  const getOrInit = function (element: Element, comparator: (a: Element, b: Element) => boolean) {
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

const transform = function <K extends keyof HTMLElementTagNameMap> (scope: string | null, tag: K) {
  return function (generators: Generators): GeneratorsTransform {
    const position = Cell(Option.none<Element>());
    verifyGenerators(generators);
    const list: Item[] = [];

    const find = function (element: Element, comparator: (a: Element, b: Element) => boolean) {
      return Arr.find(list, function (x) {
        return comparator(x.item, element);
      });
    };

    const makeNew = function (element: Element) {
      const attrs: Record<string, string | number | boolean | null> = {
        scope
      };
      const cell = generators.replace(element, tag, attrs);
      list.push({
        item: element,
        sub: cell
      });
      if (position.get().isNone()) {
        position.set(Option.some(cell));
      }
      return cell;
    };

    const replaceOrInit = function (element: Element, comparator: (a: Element, b: Element) => boolean) {
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

const merging = function (generators: Generators) {
  verifyGenerators(generators);
  const position = Cell(Option.none<Element>());

  const combine = function (cell: Element) {
    if (position.get().isNone()) {
      position.set(Option.some(cell));
    }
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

export const Generators = {
  modification,
  transform,
  merging
};
