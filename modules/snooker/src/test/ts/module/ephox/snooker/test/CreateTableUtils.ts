import { Arr, Fun } from '@ephox/katamari';

interface TableConfig {
  readonly numCols: number;
  readonly colgroup: boolean;
  readonly lockedColumns: number[];
}

const generateTestTable = (bodyContent: string[], headerContent: string[], footerContent: string[], config: TableConfig): string => {
  const numCols = config.numCols;
  const theadContent = headerContent.length > 0 ? `<thead><tr>${headerContent.join('')}</tr></thead>` : ``;
  const tfootContent = footerContent.length > 0 ? `<tfoot><tr>${footerContent.join('')}</tr></tfoot>` : ``;
  const colgroupContent = config.colgroup ? `<colgroup>${Arr.range(numCols, Fun.constant('<col>')).join('')}</colgroup>` : ``;

  return `<table${config.lockedColumns.length > 0 ? ` data-snooker-locked-cols="${config.lockedColumns.join(',')}"` : ''}>` +
    colgroupContent +
    theadContent +
    '<tbody>' +
    bodyContent.join('') +
    '</tbody>' +
    tfootContent +
    '</table>';
};

const generateTestTableBody = (rows: number, cols: number, tdContent: (row: number, column: number) => string = (r, c) => `${r}-${c}`): string[] =>
  Arr.range(
    rows,
    (row) =>
      '<tr>' +
      Arr.range(cols, (column) => '<td>' + tdContent(row, column) + '</td>').join('') +
      '</tr>'
  );

export {
  generateTestTable,
  generateTestTableBody
};
