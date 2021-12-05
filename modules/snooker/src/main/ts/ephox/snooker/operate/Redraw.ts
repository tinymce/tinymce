import { Arr } from '@ephox/katamari';
import { Attribute, Insert, InsertAll, Remove, Replication, SelectorFilter, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';

import { Detail, DetailNew, RowDetailNew, Section } from '../api/Structs';

interface NewRowsAndCells {
  readonly newRows: SugarElement<HTMLTableRowElement>[];
  readonly newCells: SugarElement<HTMLTableCellElement>[];
}

const setIfNot = (element: SugarElement<Element>, property: string, value: number, ignore: number): void => {
  if (value === ignore) {
    Attribute.remove(element, property);
  } else {
    Attribute.set(element, property, value);
  }
};

const insert = (table: SugarElement<HTMLTableElement>, selector: string, element: SugarElement<HTMLTableSectionElement | HTMLTableColElement>) => {
  Arr.last(SelectorFilter.children(table, selector)).fold(
    () => Insert.prepend(table, element),
    (child) => Insert.after(child, element)
  );
};

const generateSection = (table: SugarElement<HTMLTableElement>, sectionName: Section) => {
  const section = SelectorFind.child(table, sectionName).getOrThunk(() => {
    const newSection = SugarElement.fromTag(sectionName, Traverse.owner(table).dom);
    if (sectionName === 'thead') {
      insert(table, 'caption,colgroup', newSection);
    } else if (sectionName === 'colgroup') {
      insert(table, 'caption', newSection);
    } else {
      Insert.append(table, newSection);
    }
    return newSection;
  });

  Remove.empty(section);

  return section;
};

const render = (table: SugarElement<HTMLTableElement>, grid: RowDetailNew<DetailNew>[]): NewRowsAndCells => {
  const newRows: SugarElement<HTMLTableRowElement>[] = [];
  const newCells: SugarElement<HTMLTableCellElement>[] = [];

  const syncRows = (gridSection: RowDetailNew<DetailNew<HTMLTableCellElement>, HTMLTableRowElement>[]) =>
    Arr.map(gridSection, (row) => {
      if (row.isNew) {
        newRows.push(row.element);
      }
      const tr = row.element;
      Remove.empty(tr);
      Arr.each(row.cells, (cell) => {
        if (cell.isNew) {
          newCells.push(cell.element);
        }
        setIfNot(cell.element, 'colspan', cell.colspan, 1);
        setIfNot(cell.element, 'rowspan', cell.rowspan, 1);
        Insert.append(tr, cell.element);
      });
      return tr;
    });

  // Assumption we should only ever have 1 colgroup. The spec allows for multiple, however it's currently unsupported
  const syncColGroup = (gridSection: RowDetailNew<DetailNew<HTMLTableColElement>, HTMLTableColElement>[]) =>
    Arr.bind(gridSection, (colGroup) =>
      Arr.map(colGroup.cells, (col) => {
        setIfNot(col.element, 'span', col.colspan, 1);
        return col.element;
      })
    );

  const renderSection = (gridSection: RowDetailNew<DetailNew>[], sectionName: Section) => {
    const section = generateSection(table, sectionName);
    const sync = sectionName === 'colgroup' ? syncColGroup : syncRows;
    const sectionElems = sync(gridSection as RowDetailNew<any, any>[]);
    InsertAll.append(section, sectionElems);
  };

  const removeSection = (sectionName: Section) => {
    SelectorFind.child(table, sectionName).each(Remove.remove);
  };

  const renderOrRemoveSection = (gridSection: RowDetailNew<DetailNew>[], sectionName: Section) => {
    if (gridSection.length > 0) {
      renderSection(gridSection, sectionName);
    } else {
      removeSection(sectionName);
    }
  };

  const headSection: RowDetailNew<DetailNew>[] = [];
  const bodySection: RowDetailNew<DetailNew>[] = [];
  const footSection: RowDetailNew<DetailNew>[] = [];
  const columnGroupsSection: RowDetailNew<DetailNew>[] = [];

  Arr.each(grid, (row) => {
    switch (row.section) {
      case 'thead':
        headSection.push(row);
        break;
      case 'tbody':
        bodySection.push(row);
        break;
      case 'tfoot':
        footSection.push(row);
        break;
      case 'colgroup':
        columnGroupsSection.push(row);
        break;
    }
  });

  renderOrRemoveSection(columnGroupsSection, 'colgroup');
  renderOrRemoveSection(headSection, 'thead');
  renderOrRemoveSection(bodySection, 'tbody');
  renderOrRemoveSection(footSection, 'tfoot');

  return {
    newRows,
    newCells
  };
};

const copy = <T extends Detail> (grid: RowDetailNew<T>[]): SugarElement<HTMLTableRowElement | HTMLTableColElement>[] => Arr.map(grid, (row) => {
  // Shallow copy the row element
  const tr = Replication.shallow(row.element);
  Arr.each(row.cells, (cell) => {
    const clonedCell = Replication.deep(cell.element);
    setIfNot(clonedCell, 'colspan', cell.colspan, 1);
    setIfNot(clonedCell, 'rowspan', cell.rowspan, 1);
    Insert.append(tr, clonedCell);
  });
  return tr;
});

export {
  render,
  copy
};
