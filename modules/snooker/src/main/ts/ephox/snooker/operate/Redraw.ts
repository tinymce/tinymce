import { Arr } from '@ephox/katamari';
import { Attribute, Insert, InsertAll, Remove, Replication, SelectorFilter, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';
import { Detail, DetailNew, RowDataNew, Section } from '../api/Structs';

const setIfNot = (element: SugarElement, property: string, value: number, ignore: number): void => {
  if (value === ignore) {
    Attribute.remove(element, property);
  } else {
    Attribute.set(element, property, value);
  }
};

interface NewRowsAndCells {
  readonly newRows: SugarElement[];
  readonly newCells: SugarElement[];
}

const render = <T extends DetailNew> (table: SugarElement, grid: RowDataNew<T>[]): NewRowsAndCells => {
  const newRows: SugarElement[] = [];
  const newCells: SugarElement[] = [];

  const insert = (selector: string, element: SugarElement<HTMLTableSectionElement | HTMLTableColElement>) => {
    const lastChild = Arr.last(SelectorFilter.children(table, selector));

    lastChild.fold(
      () => Insert.prepend(table, element),
      (child) => Insert.after(child, element)
    );
  };

  const syncRows = (gridSection: RowDataNew<T>[]) =>
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

  const syncColGroup = (gridSection: RowDataNew<T>[]) =>
    // Assumption we should only ever have 1 colgroup in the section
    Arr.bind(gridSection, (colGroup) =>
      Arr.map(colGroup.cells, (col) => {
        setIfNot(col.element, 'span', col.colspan, 1);
        return col.element;
      })
    );

  const renderSection = (gridSection: RowDataNew<T>[], sectionName: Section) => {
    const section = SelectorFind.child(table, sectionName).getOrThunk(() => {
      const tb = SugarElement.fromTag(sectionName, Traverse.owner(table).dom);
      if (sectionName === 'thead') {
        insert('caption,colgroup', tb);
      } else if (sectionName === 'colgroup') {
        insert('caption', tb);
      } else {
        Insert.append(table, tb);
      }
      return tb;
    });

    Remove.empty(section);

    const sync = sectionName === 'colgroup' ? syncColGroup : syncRows;
    const rows = sync(gridSection);
    InsertAll.append(section, rows);
  };

  const removeSection = (sectionName: Section) => {
    SelectorFind.child(table, sectionName).each(Remove.remove);
  };

  const renderOrRemoveSection = (gridSection: RowDataNew<T>[], sectionName: Section) => {
    if (gridSection.length > 0) {
      renderSection(gridSection, sectionName);
    } else {
      removeSection(sectionName);
    }
  };

  const headSection: RowDataNew<T>[] = [];
  const bodySection: RowDataNew<T>[] = [];
  const footSection: RowDataNew<T>[] = [];
  const columnGroupsSection: RowDataNew<T>[] = [];

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

  if (columnGroupsSection.length) {
    renderOrRemoveSection(columnGroupsSection, 'colgroup');
  }

  renderOrRemoveSection(headSection, 'thead');
  renderOrRemoveSection(bodySection, 'tbody');
  renderOrRemoveSection(footSection, 'tfoot');

  return {
    newRows,
    newCells
  };
};

const copy = <T extends Detail> (grid: RowDataNew<T>[]): SugarElement<HTMLTableRowElement>[] => Arr.map(grid, (row) => {
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
