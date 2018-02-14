import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';

export interface RenderOptions {
  styles: { [key: string]: string };
  attributes: { [key: string]: string };
  percentages: boolean;
}

const DefaultRenderOptions = {
  styles: {
    'border-collapse': 'collapse',
    width: '100%'
  },
  attributes: {
    border: '1'
  },
  percentages: true
};

var makeTable = function () {
  return Element.fromTag('table');
};

var tableBody = function () {
  return Element.fromTag('tbody');
}

var tableRow = function () {
  return Element.fromTag('tr');
};

var tableHeaderCell = function () {
  return Element.fromTag('th');
};

var tableCell = function () {
  return Element.fromTag('td');
};

var render = (rows: number, columns: number, rowHeaders: number, columnHeaders: number, renderOpts: RenderOptions = DefaultRenderOptions) => {
  var table = makeTable();

  Css.setAll(table, renderOpts.styles);
  Attr.setAll(table, renderOpts.attributes);

  var tbody = tableBody();
  Insert.append(table, tbody);

  // Setting initial widths on cells to avoid jumpy stretching of the active cell and shrinkage of the surrounding ones (see TINY-1398).
  var trs = [];
  for (var i = 0; i < rows; i++) {
    var tr = tableRow();
    for (var j = 0; j < columns; j++) {

      var td = i < rowHeaders || j < columnHeaders ? tableHeaderCell() : tableCell();
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

export {
  render
};