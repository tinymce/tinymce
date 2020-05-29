import { HTMLTableCellElement, HTMLTableElement, HTMLTableRowElement } from '@ephox/dom-globals';
import Editor from "tinymce/core/api/Editor";
import { Arr } from '@ephox/katamari/src/main/ts/ephox/katamari/api/Main';

// WARNING: mutates the dom!!
const convertCellType = (editor: Editor, cells: HTMLTableCellElement[], newType: string) => {
  const dom = editor.dom;
  return Arr.map(cells, (cell) => {
    if (newType && cell.nodeName.toLowerCase() !== newType) {
      return dom.rename(cell, newType) as HTMLTableCellElement;
    }
    return cell;
  });
};

const getRows = (editor) => {
  const dom = editor.dom;
  const rows = [];

  const tableElm = dom.getParent(editor.selection.getStart(), 'table') as HTMLTableElement;

  if (!tableElm) {
    // If this element is null, return now to avoid crashing.
    return;
  }

  const cellElm = dom.getParent(editor.selection.getStart(), 'td,th') as HTMLTableCellElement;

  Arr.each(tableElm.rows, (row) => {
    Arr.each(row.cells, (cell) => {
      if ((dom.getAttrib(cell, 'data-mce-selected') || cell === cellElm) && rows.indexOf(row) < 0) {
        rows.push(row);
        return false;
      }
    });
  });

  if (rows.length < 1) {
    // If we didn't find any rows somehow, return now to avoid crashing.
    return;
  }

  return rows;
};

const getCellsInRows = (rows: HTMLTableRowElement[]) => {
  if (rows.length > 1) {
    return Arr.flatten(Arr.map<any, any>(rows, (row) => row.cells));
  } else {
    return Arr.map<any, any>(rows, (row) => row.cells);
  }
};

// WARNING: mutates the dom!!
const convertCellTypeForRows = (editor: Editor, newType: string) => {
  const rows = getRows(editor);
  console.log(rows);
  const cells = getCellsInRows(rows);
  console.log(cells);
  return convertCellType(editor, cells as any, newType);
};

export {
  convertCellType,
  convertCellTypeForRows,
  getRows
};