import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { Attribute, Css, SugarElement, SugarNode } from '@ephox/sugar';

import { getAttrValue } from '../util/CellUtils';

export interface RowData {
  readonly element: SugarElement<HTMLTableRowElement | HTMLTableColElement>;
}

export interface CellData {
  readonly element: SugarElement<HTMLTableCellElement | HTMLTableColElement>;
  readonly colspan: number;
  readonly rowspan: number;
}

export interface Generators {
  readonly cell: (cellData: CellData) => SugarElement<HTMLTableCellElement>;
  readonly row: (rowData: RowData) => SugarElement<HTMLTableRowElement>;
  readonly replace: <K extends keyof HTMLElementTagNameMap>(cell: SugarElement<HTMLTableCellElement>, tag: K, attrs: Record<string, string | number | boolean | null>) => SugarElement<HTMLElementTagNameMap[K]>;
  readonly gap: () => SugarElement<HTMLTableCellElement>;
  readonly colGap: () => SugarElement<HTMLTableColElement>;
  readonly col: (prev: CellData) => SugarElement<HTMLTableColElement>;
  readonly colgroup: (prev: RowData) => SugarElement<HTMLTableColElement>;
}

export interface SimpleGenerators extends Generators {
  readonly cell: () => SugarElement<HTMLTableCellElement>;
  readonly row: () => SugarElement<HTMLTableRowElement>;
  readonly replace: <T extends HTMLElement>(cell: SugarElement<HTMLTableCellElement>) => SugarElement<T>;
  readonly gap: () => SugarElement<HTMLTableCellElement>;
  readonly col: () => SugarElement<HTMLTableColElement>;
  readonly colgroup: () => SugarElement<HTMLTableColElement>;
}

export interface GeneratorsWrapper {}

export interface GeneratorsModification extends GeneratorsWrapper {
  readonly getOrInit: (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) => SugarElement;
}

export interface GeneratorsTransform extends GeneratorsWrapper {
  readonly replaceOrInit: (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) => SugarElement;
}

export interface GeneratorsMerging extends GeneratorsWrapper {
  readonly unmerge: (cell: SugarElement) => () => SugarElement;
  readonly merge: (cells: SugarElement[]) => () => SugarElement;
}

interface Recent {
  readonly item: SugarElement;
  readonly replacement: SugarElement;
}

interface Item {
  readonly item: SugarElement;
  readonly sub: SugarElement;
}

const isCol = SugarNode.isTag('col');
const isColgroup = SugarNode.isTag('colgroup');

const isRow = (element: SugarElement): element is SugarElement<HTMLTableRowElement | HTMLTableColElement> =>
  SugarNode.name(element) === 'tr' || isColgroup(element);

const elementToData = (element: SugarElement): CellData => {
  const colspan = getAttrValue(element, 'colspan', 1);
  const rowspan = getAttrValue(element, 'rowspan', 1);
  return {
    element,
    colspan,
    rowspan
  };
};

// note that `toData` seems to be only for testing
const modification = (generators: Generators, toData = elementToData): GeneratorsModification => {

  const nuCell = (data: CellData) =>
    isCol(data.element) ? generators.col(data) : generators.cell(data);

  const nuRow = (data: RowData) =>
    isColgroup(data.element) ? generators.colgroup(data) : generators.row(data);

  const add = (element: SugarElement) => {
    if (isRow(element)) {
      return nuRow({ element });
    } else {
      const replacement = nuCell(toData(element));
      recent = Optional.some({ item: element, replacement });
      return replacement;
    }
  };

  let recent = Optional.none<Recent>();
  const getOrInit = (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) => {
    return recent.fold(() => {
      return add(element);
    }, (p) => {
      return comparator(element, p.item) ? p.replacement : add(element);
    });
  };

  return {
    getOrInit
  };
};

const transform = <K extends keyof HTMLElementTagNameMap> (tag: K) => {
  return (generators: Generators): GeneratorsTransform => {
    const list: Item[] = [];

    const find = (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) => {
      return Arr.find(list, (x) => {
        return comparator(x.item, element);
      });
    };

    const makeNew = (element: SugarElement) => {
      // Ensure scope is never set on a td element as it's a deprecated attribute
      const attrs: Record<string, string | number | null> = tag === 'td' ? { scope: null } : {};
      const cell = generators.replace(element, tag, attrs);
      list.push({
        item: element,
        sub: cell
      });
      return cell;
    };

    const replaceOrInit = (element: SugarElement, comparator: (a: SugarElement, b: SugarElement) => boolean) => {
      if (isRow(element) || isCol(element)) {
        return element;
      } else {
        return find(element, comparator).fold(() => {
          return makeNew(element);
        }, (p) => {
          return comparator(element, p.item) ? p.sub : makeNew(element);
        });
      }
    };

    return {
      replaceOrInit
    };
  };
};

const getScopeAttribute = (cell: SugarElement) =>
  Attribute.getOpt(cell, 'scope').map(
    // Attribute can be col, colgroup, row, and rowgroup.
    // As col and colgroup are to be treated as if they are the same, lob off everything after the first three characters and there is no difference.
    (attribute) => attribute.substr(0, 3)
  );

const merging = (generators: Generators): GeneratorsMerging => {
  const unmerge = (cell: SugarElement) => {
    const scope = getScopeAttribute(cell);

    scope.each((attribute) => Attribute.set(cell, 'scope', attribute));

    return () => {
      const raw = generators.cell({
        element: cell,
        colspan: 1,
        rowspan: 1
      });
      // Remove any width calculations because they are no longer relevant.
      Css.remove(raw, 'width');
      Css.remove(cell, 'width');

      scope.each((attribute) => Attribute.set(raw, 'scope', attribute));

      return raw;
    };
  };

  const merge = (cells: SugarElement[]) => {
    const getScopeProperty = () => {

      const stringAttributes = Optionals.cat(
        Arr.map(cells, getScopeAttribute)
      );

      if (stringAttributes.length === 0) {
        return Optional.none<string>();
      } else {
        const baseScope = stringAttributes[0];
        const scopes = [ 'row', 'col' ];

        const isMixed = Arr.exists(stringAttributes, (attribute) => {
          return attribute !== baseScope && Arr.contains(scopes, attribute);
        });

        return isMixed ? Optional.none<string>() : Optional.from(baseScope);
      }
    };

    Css.remove(cells[0], 'width');

    getScopeProperty().fold(
      () => Attribute.remove(cells[0], 'scope'),
      (attribute) => Attribute.set(cells[0], 'scope', attribute + 'group')
    );

    return Fun.constant(cells[0]);
  };

  return {
    unmerge,
    merge
  };
};

export const Generators = {
  modification,
  transform,
  merging
};
