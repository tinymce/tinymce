import { HTMLTableRowElement } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { Attr, Element, Insert, InsertAll, Remove, Replication, SelectorFilter, SelectorFind, Traverse } from '@ephox/sugar';
import { Detail, DetailNew, RowDataNew } from '../api/Structs';

const setIfNot = function (element: Element, property: string, value: number, ignore: number): void {
  if (value === ignore) {
    Attr.remove(element, property);
  } else {
    Attr.set(element, property, value);
  }
};

interface NewRowsAndCells {
  readonly newRows: Element[];
  readonly newCells: Element[];
}

const render = function <T extends DetailNew> (table: Element, grid: RowDataNew<T>[]): NewRowsAndCells {
  const newRows: Element[] = [];
  const newCells: Element[] = [];

  const insertThead = Arr.last(SelectorFilter.children(table, 'caption,colgroup')).fold(
    () => Fun.curry(Insert.prepend, table),
    (c) => Fun.curry(Insert.after, c)
  );

  const renderSection = function (gridSection: RowDataNew<T>[], sectionName: 'thead' | 'tbody' | 'tfoot') {
    const section = SelectorFind.child(table, sectionName).getOrThunk(function () {
      const tb = Element.fromTag(sectionName, Traverse.owner(table).dom());
      sectionName === 'thead' ? insertThead(tb) : Insert.append(table, tb); // mutation
      return tb;
    });

    Remove.empty(section);

    const rows = Arr.map(gridSection, function (row) {
      if (row.isNew()) {
        newRows.push(row.element());
      }
      const tr = row.element();
      Remove.empty(tr);
      Arr.each(row.cells(), function (cell) {
        if (cell.isNew()) {
          newCells.push(cell.element());
        }
        setIfNot(cell.element(), 'colspan', cell.colspan(), 1);
        setIfNot(cell.element(), 'rowspan', cell.rowspan(), 1);
        Insert.append(tr, cell.element());
      });
      return tr;
    });

    InsertAll.append(section, rows);
  };

  const removeSection = function (sectionName: 'thead' | 'tbody' | 'tfoot') {
    SelectorFind.child(table, sectionName).each(Remove.remove);
  };

  const renderOrRemoveSection = function (gridSection: RowDataNew<T>[], sectionName: 'thead' | 'tbody' | 'tfoot') {
    if (gridSection.length > 0) {
      renderSection(gridSection, sectionName);
    } else {
      removeSection(sectionName);
    }
  };

  const headSection: RowDataNew<T>[] = [];
  const bodySection: RowDataNew<T>[] = [];
  const footSection: RowDataNew<T>[] = [];

  Arr.each(grid, function (row) {
    switch (row.section()) {
      case 'thead':
        headSection.push(row);
        break;
      case 'tbody':
        bodySection.push(row);
        break;
      case 'tfoot':
        footSection.push(row);
        break;
    }
  });

  renderOrRemoveSection(headSection, 'thead');
  renderOrRemoveSection(bodySection, 'tbody');
  renderOrRemoveSection(footSection, 'tfoot');

  return {
    newRows,
    newCells
  };
};

const copy = <T extends Detail> (grid: RowDataNew<T>[]): Element<HTMLTableRowElement>[] => Arr.map(grid, (row) => {
  // Shallow copy the row element
  const tr = Replication.shallow(row.element());
  Arr.each(row.cells(), (cell) => {
    const clonedCell = Replication.deep(cell.element());
    setIfNot(clonedCell, 'colspan', cell.colspan(), 1);
    setIfNot(clonedCell, 'rowspan', cell.rowspan(), 1);
    Insert.append(tr, clonedCell);
  });
  return tr;
});

export {
  render,
  copy
};
