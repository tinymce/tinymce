import { Arr, Optional, Strings } from '@ephox/katamari';
import { Attribute, Compare, Insert, InsertAll, Replication, SelectorFilter, SugarElement } from '@ephox/sugar';

export interface TableModel {
  readonly element: SugarElement<HTMLTableElement>;
  readonly width: number;
  readonly rows: TableRowModel[];
}

export interface TableRowModel {
  readonly element: SugarElement<HTMLTableRowElement>;
  readonly cells: SugarElement<HTMLTableCellElement>[];
}

interface CellPosition {
  readonly x: number;
  readonly y: number;
}

const tableModel = (element: SugarElement<HTMLTableElement>, width: number, rows: TableRowModel[]): TableModel => ({
  element,
  width,
  rows
});

const tableRow = (element: SugarElement<HTMLTableRowElement>, cells: SugarElement<HTMLTableCellElement>[]): TableRowModel => ({
  element,
  cells
});

const cellPosition = (x: number, y: number): CellPosition => ({
  x,
  y
});

const getSpan = (td: SugarElement<HTMLTableCellElement>, key: string) => {
  return Attribute.getOpt(td, key).bind(Strings.toInt).getOr(1);
};

const fillout = (table: TableModel, x: number, y: number, tr: SugarElement<HTMLTableRowElement>, td: SugarElement<HTMLTableCellElement>) => {
  const rowspan = getSpan(td, 'rowspan');
  const colspan = getSpan(td, 'colspan');
  const rows = table.rows;

  for (let y2 = y; y2 < y + rowspan; y2++) {
    if (!rows[y2]) {
      rows[y2] = tableRow(Replication.deep(tr), []);
    }

    for (let x2 = x; x2 < x + colspan; x2++) {
      const cells = rows[y2].cells;

      // not filler td:s are purposely not cloned so that we can
      // find cells in the model by element object references
      cells[x2] = y2 === y && x2 === x ? td : Replication.shallow(td);
    }
  }
};

const cellExists = (table: TableModel, x: number, y: number) => {
  const rows = table.rows;
  const cells = rows[y] ? rows[y].cells : [];
  return !!cells[x];
};

const skipCellsX = (table: TableModel, x: number, y: number) => {
  while (cellExists(table, x, y)) {
    x++;
  }

  return x;
};

const getWidth = (rows: TableRowModel[]) => {
  return Arr.foldl(rows, (acc, row) => {
    return row.cells.length > acc ? row.cells.length : acc;
  }, 0);
};

const findElementPos = (table: TableModel, element: SugarElement<unknown>): Optional<CellPosition> => {
  const rows = table.rows;
  for (let y = 0; y < rows.length; y++) {
    const cells = rows[y].cells;
    for (let x = 0; x < cells.length; x++) {
      if (Compare.eq(cells[x], element)) {
        return Optional.some(cellPosition(x, y));
      }
    }
  }

  return Optional.none();
};

const extractRows = (table: TableModel, sx: number, sy: number, ex: number, ey: number) => {
  const newRows = [];
  const rows = table.rows;

  for (let y = sy; y <= ey; y++) {
    const cells = rows[y].cells;
    const slice = sx < ex ? cells.slice(sx, ex + 1) : cells.slice(ex, sx + 1);
    newRows.push(tableRow(rows[y].element, slice));
  }

  return newRows;
};

const subTable = (table: TableModel, startPos: CellPosition, endPos: CellPosition) => {
  const sx = startPos.x, sy = startPos.y;
  const ex = endPos.x, ey = endPos.y;
  const newRows = sy < ey ? extractRows(table, sx, sy, ex, ey) : extractRows(table, sx, ey, ex, sy);

  return tableModel(table.element, getWidth(newRows), newRows);
};

const createDomTable = (table: TableModel, rows: SugarElement<HTMLTableRowElement>[]) => {
  const tableElement = Replication.shallow(table.element);
  const tableBody = SugarElement.fromTag('tbody');

  InsertAll.append(tableBody, rows);
  Insert.append(tableElement, tableBody);

  return tableElement;
};

const modelRowsToDomRows = (table: TableModel) => {
  return Arr.map(table.rows, (row) => {
    const cells = Arr.map(row.cells, (cell) => {
      const td = Replication.deep(cell);
      Attribute.remove(td, 'colspan');
      Attribute.remove(td, 'rowspan');
      return td;
    });

    const tr = Replication.shallow(row.element);
    InsertAll.append(tr, cells);
    return tr;
  });
};

const fromDom = (tableElm: SugarElement<HTMLTableElement>): TableModel => {
  const table = tableModel(Replication.shallow(tableElm), 0, []);

  Arr.each(SelectorFilter.descendants<HTMLTableRowElement>(tableElm, 'tr'), (tr, y) => {
    Arr.each(SelectorFilter.descendants<HTMLTableCellElement>(tr, 'td,th'), (td, x) => {
      fillout(table, skipCellsX(table, x, y), y, tr, td);
    });
  });

  return tableModel(table.element, getWidth(table.rows), table.rows);
};

const toDom = (table: TableModel): SugarElement<HTMLTableElement> => {
  return createDomTable(table, modelRowsToDomRows(table));
};

const subsection = (table: TableModel, startElement: SugarElement<Node>, endElement: SugarElement<Node>): Optional<TableModel> => {
  return findElementPos(table, startElement).bind((startPos) => {
    return findElementPos(table, endElement).map((endPos) => {
      return subTable(table, startPos, endPos);
    });
  });
};

export {
  fromDom,
  toDom,
  subsection
};
