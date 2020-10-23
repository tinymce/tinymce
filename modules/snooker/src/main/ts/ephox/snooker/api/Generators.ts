import { Arr, Cell, Contracts, Optional } from '@ephox/katamari';
import { Css, SugarElement, SugarNode } from '@ephox/sugar';
import { getAttrValue } from '../util/CellUtils';

export interface CellSpan {
  readonly element: SugarElement<HTMLTableCellElement | HTMLTableColElement>;
  readonly colspan: number;
  readonly rowspan: number;
}

export interface Generators {
  readonly cell: (cellSpan: CellSpan) => SugarElement<HTMLTableCellElement>;
  readonly row: () => SugarElement<HTMLTableRowElement>;
  readonly replace: <K extends keyof HTMLElementTagNameMap>(cell: SugarElement<HTMLTableCellElement>, tag: K, attrs: Record<string, string | number | boolean | null>) => SugarElement<HTMLElementTagNameMap[K]>;
  readonly gap: () => SugarElement<HTMLTableCellElement>;
  readonly col: (prev: CellSpan) => SugarElement<HTMLTableColElement>;
  readonly colgroup: () => SugarElement<HTMLTableColElement>;
}

export interface SimpleGenerators extends Generators {
  readonly cell: () => SugarElement<HTMLTableCellElement>;
  readonly row: () => SugarElement<HTMLTableRowElement>;
  readonly replace: <T extends HTMLElement>(cell: SugarElement<HTMLTableCellElement>) => SugarElement<T>;
  readonly gap: () => SugarElement<HTMLTableCellElement>;
  readonly col: () => SugarElement<HTMLTableColElement>;
  readonly colgroup: () => SugarElement<HTMLTableColElement>;
}

export interface GeneratorsWrapper {
  readonly cursor: () => Optional<SugarElement>;
}

export interface GeneratorsModification extends GeneratorsWrapper {
  readonly getOrInit: (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) => SugarElement;
}

export interface GeneratorsTransform extends GeneratorsWrapper {
  readonly replaceOrInit: (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) => SugarElement;
}

export interface GeneratorsMerging extends GeneratorsWrapper {
  readonly combine: (cell: SugarElement) => () => SugarElement;
}

interface Recent {
  readonly item: SugarElement;
  readonly replacement: SugarElement;
}

interface Item {
  readonly item: SugarElement;
  readonly sub: SugarElement;
}

const verifyGenerators: (gen: Generators) => Generators = Contracts.exactly([ 'cell', 'row', 'replace', 'gap', 'col', 'colgroup' ]);

const elementToData = function (element: SugarElement): CellSpan {
  const colspan = getAttrValue(element, 'colspan', 1);
  const rowspan = getAttrValue(element, 'rowspan', 1);
  return {
    element,
    colspan,
    rowspan
  };
};

// note that `toData` seems to be only for testing
const modification = function (generators: Generators, toData = elementToData): GeneratorsModification {
  verifyGenerators(generators);
  const position = Cell(Optional.none<SugarElement>());

  const nu = function (data: CellSpan) {
    switch (SugarNode.name(data.element)) {
      case 'col':
        return generators.col(data);
      default:
        return generators.cell(data);
    }
  };

  const nuFrom = function (element: SugarElement) {
    const data = toData(element);
    return nu(data);
  };

  const add = function (element: SugarElement) {
    const replacement = nuFrom(element);
    if (position.get().isNone()) {
      position.set(Optional.some(replacement));
    }
    recent = Optional.some({ item: element, replacement });
    return replacement;
  };

  let recent = Optional.none<Recent>();
  const getOrInit = function (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) {
    return recent.fold(function () {
      return add(element);
    }, function (p) {
      return comparator(element, p.item) ? p.replacement : add(element);
    });
  };

  return {
    getOrInit,
    cursor: position.get
  };
};

const transform = function <K extends keyof HTMLElementTagNameMap> (scope: string | null, tag: K) {
  return function (generators: Generators): GeneratorsTransform {
    const position = Cell(Optional.none<SugarElement>());
    verifyGenerators(generators);
    const list: Item[] = [];

    const find = function (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) {
      return Arr.find(list, function (x) {
        return comparator(x.item, element);
      });
    };

    const makeNew = function (element: SugarElement) {
      const attrs: Record<string, string | number | boolean | null> = {
        scope
      };
      const cell = generators.replace(element, tag, attrs);
      list.push({
        item: element,
        sub: cell
      });
      if (position.get().isNone()) {
        position.set(Optional.some(cell));
      }
      return cell;
    };

    const replaceOrInit = function (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) {
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
  const position = Cell(Optional.none<SugarElement>());

  const combine = function (cell: SugarElement) {
    if (position.get().isNone()) {
      position.set(Optional.some(cell));
    }
    return function () {
      const raw = generators.cell({
        element: cell,
        colspan: 1,
        rowspan: 1
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
