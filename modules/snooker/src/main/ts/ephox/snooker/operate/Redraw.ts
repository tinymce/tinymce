import { Arr, Fun } from '@ephox/katamari';
import { Attr, Element, Insert, InsertAll, Remove, Replication, SelectorFind, Traverse } from '@ephox/sugar';

const setIfNot = function (element, property, value, ignore) {
  if (value === ignore) { Attr.remove(element, property); } else { Attr.set(element, property, value); }
};

const render = function (table, grid) {
  const newRows = [];
  const newCells = [];

  const renderSection = function (gridSection, sectionName) {
    const section = SelectorFind.child(table, sectionName).getOrThunk(function () {
      const tb = Element.fromTag(sectionName, Traverse.owner(table).dom());
      Insert.append(table, tb);
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

  const removeSection = function (sectionName) {
    SelectorFind.child(table, sectionName).each(Remove.remove);
  };

  const renderOrRemoveSection = function (gridSection, sectionName) {
    if (gridSection.length > 0) {
      renderSection(gridSection, sectionName);
    } else {
      removeSection(sectionName);
    }
  };

  const headSection = [];
  const bodySection = [];
  const footSection = [];

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
    newRows: Fun.constant(newRows),
    newCells: Fun.constant(newCells)
  };
};

const copy = function (grid) {
  const rows = Arr.map(grid, function (row) {
    // Shallow copy the row element
    const tr = Replication.shallow(row.element());
    Arr.each(row.cells(), function (cell) {
      const clonedCell = Replication.deep(cell.element());
      setIfNot(clonedCell, 'colspan', cell.colspan(), 1);
      setIfNot(clonedCell, 'rowspan', cell.rowspan(), 1);
      Insert.append(tr, clonedCell);
    });
    return tr;
  });
  return rows;
};

export default {
  render,
  copy
};