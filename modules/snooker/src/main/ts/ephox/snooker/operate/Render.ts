import { Attr, Css, Element, Insert, InsertAll } from '@ephox/sugar';
import { Arr } from '@ephox/katamari';

export interface RenderOptions {
  styles: Record<string, string>;
  attributes: Record<string, string>;
}

const DefaultRenderOptions: RenderOptions = {
  styles: {
    'border-collapse': 'collapse',
    'width': '100%'
  },
  attributes: {
    border: '1'
  }
};

const tableHeaderCell = () => Element.fromTag('th');

const tableCell = () => Element.fromTag('td');

const createRow = (columns: number, rowHeaders: number, columnHeaders: number, rowIndex: number) => {
  const tr = Element.fromTag('tr');
  for (let j = 0; j < columns; j++) {

    const td = rowIndex < rowHeaders || j < columnHeaders ? tableHeaderCell() : tableCell();
    if (j < columnHeaders) { Attr.set(td, 'scope', 'row'); }
    if (rowIndex < rowHeaders) { Attr.set(td, 'scope', 'col'); }

    // Note, this is a placeholder so that the cells have height. The unicode character didn't work in IE10.
    Insert.append(td, Element.fromTag('br'));
    Insert.append(tr, td);
  }
  return tr;
};

const createRows = (rows: number, columns: number, rowHeaders: number, columnHeaders: number) =>
  Arr.range(rows, (r) => createRow(columns, rowHeaders, columnHeaders, r));

const render = (rows: number, columns: number, rowHeaders: number, columnHeaders: number, headerType: string, renderOpts: RenderOptions = DefaultRenderOptions) => {
  const table = Element.fromTag('table');
  const rowHeadersGoInThead = headerType !== 'cells';

  Css.setAll(table, renderOpts.styles);
  Attr.setAll(table, renderOpts.attributes);

  const actualRowHeaders = Math.min(rows, rowHeaders);

  if (rowHeadersGoInThead && rowHeaders > 0) {
    const thead = Element.fromTag('thead');
    Insert.append(table, thead);

    const theadRowHeaders = headerType === 'sectionCells' ? actualRowHeaders : 0;
    const theadRows = createRows(rowHeaders, columns, theadRowHeaders, columnHeaders);
    InsertAll.append(thead, theadRows);
  }

  const tbody = Element.fromTag('tbody');
  Insert.append(table, tbody);

  const numRows = rowHeadersGoInThead ? rows - actualRowHeaders : rows;
  const numRowHeaders = rowHeadersGoInThead ? 0 : rowHeaders;
  const tbodyRows = createRows(numRows, columns, numRowHeaders, columnHeaders);

  InsertAll.append(tbody, tbodyRows);
  return table;
};

export { render };
