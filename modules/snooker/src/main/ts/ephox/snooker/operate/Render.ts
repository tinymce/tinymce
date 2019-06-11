import { Attr, Css, Element, Insert, InsertAll } from '@ephox/sugar';

export interface RenderOptions {
  styles: Record<string, string>;
  attributes: Record<string, string>;
  percentages: boolean;
}

const DefaultRenderOptions: RenderOptions = {
  styles: {
    'border-collapse': 'collapse',
    'width': '100%'
  },
  attributes: {
    border: '1'
  },
  percentages: true
};

const makeTable = function () {
  return Element.fromTag('table');
};

const tableBody = function () {
  return Element.fromTag('tbody');
};

const tableRow = function () {
  return Element.fromTag('tr');
};

const tableHeaderCell = function () {
  return Element.fromTag('th');
};

const tableCell = function () {
  return Element.fromTag('td');
};

const render = (rows: number, columns: number, rowHeaders: number, columnHeaders: number, renderOpts: RenderOptions = DefaultRenderOptions) => {
  const table = makeTable();

  Css.setAll(table, renderOpts.styles);
  Attr.setAll(table, renderOpts.attributes);

  const tbody = tableBody();
  Insert.append(table, tbody);

  // Setting initial widths on cells to avoid jumpy stretching of the active cell and shrinkage of the surrounding ones (see TINY-1398).
  const trs = [];
  for (let i = 0; i < rows; i++) {
    const tr = tableRow();
    for (let j = 0; j < columns; j++) {

      const td = i < rowHeaders || j < columnHeaders ? tableHeaderCell() : tableCell();
      if (j < columnHeaders) { Attr.set(td, 'scope', 'row'); }
      if (i < rowHeaders) { Attr.set(td, 'scope', 'col'); }

      // Note, this is a placeholder so that the cells have height. The unicode character didn't work in IE10.
      Insert.append(td, Element.fromTag('br'));
      if (renderOpts.percentages) {
        Css.set(td, 'width', (100 / columns) + '%');
      }
      Insert.append(tr, td);
    }
    trs.push(tr);
  }

  InsertAll.append(tbody, trs);
  return table;
};

export { render };
