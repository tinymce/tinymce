import { Arr } from '@ephox/katamari';
import { Attribute, Css, Insert, InsertAll, SugarElement } from '@ephox/sugar';

export interface RenderOptions {
  styles: Record<string, string>;
  attributes: Record<string, string>;
  colGroups: boolean;
}

const DefaultRenderOptions: RenderOptions = {
  styles: {
    'border-collapse': 'collapse',
    'width': '100%'
  },
  attributes: {
    border: '1'
  },
  colGroups: false
};

const tableHeaderCell = () => SugarElement.fromTag('th');

const tableCell = () => SugarElement.fromTag('td');

const tableColumn = () => SugarElement.fromTag('col');

const createRow = (columns: number, rowHeaders: number, columnHeaders: number, rowIndex: number) => {
  const tr = SugarElement.fromTag('tr');
  for (let j = 0; j < columns; j++) {

    const td = rowIndex < rowHeaders || j < columnHeaders ? tableHeaderCell() : tableCell();
    if (j < columnHeaders) {
      Attribute.set(td, 'scope', 'row');
    }
    if (rowIndex < rowHeaders) {
      Attribute.set(td, 'scope', 'col');
    }

    // Note, this is a placeholder so that the cells have height. The unicode character didn't work in IE10.
    Insert.append(td, SugarElement.fromTag('br'));
    Insert.append(tr, td);
  }
  return tr;
};

const createGroupRow = (columns: number) => {
  const columnGroup = SugarElement.fromTag('colgroup');

  Arr.range(columns, () =>
    Insert.append(columnGroup, tableColumn())
  );

  return columnGroup;
};

const createRows = (rows: number, columns: number, rowHeaders: number, columnHeaders: number) =>
  Arr.range(rows, (r) => createRow(columns, rowHeaders, columnHeaders, r));

const render = (rows: number, columns: number, rowHeaders: number, columnHeaders: number, headerType: string, renderOpts: RenderOptions = DefaultRenderOptions): SugarElement<HTMLTableElement> => {
  const table = SugarElement.fromTag('table');
  const rowHeadersGoInThead = headerType !== 'cells';

  Css.setAll(table, renderOpts.styles);
  Attribute.setAll(table, renderOpts.attributes);

  if (renderOpts.colGroups) {
    Insert.append(table, createGroupRow(columns));
  }

  const actualRowHeaders = Math.min(rows, rowHeaders);

  if (rowHeadersGoInThead && rowHeaders > 0) {
    const thead = SugarElement.fromTag('thead');
    Insert.append(table, thead);

    const theadRowHeaders = headerType === 'sectionCells' ? actualRowHeaders : 0;
    const theadRows = createRows(rowHeaders, columns, theadRowHeaders, columnHeaders);
    InsertAll.append(thead, theadRows);
  }

  const tbody = SugarElement.fromTag('tbody');
  Insert.append(table, tbody);

  const numRows = rowHeadersGoInThead ? rows - actualRowHeaders : rows;
  const numRowHeaders = rowHeadersGoInThead ? 0 : rowHeaders;
  const tbodyRows = createRows(numRows, columns, numRowHeaders, columnHeaders);

  InsertAll.append(tbody, tbodyRows);
  return table;
};

export { render };
