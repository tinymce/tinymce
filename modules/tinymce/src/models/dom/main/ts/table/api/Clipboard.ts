/*
 NOTE: This file is duplicated in the following locations:
  - plugins/table/api/Clipboard.ts
 Make sure that if making changes to this file, the other files are updated as well
 */

import { Arr, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import FakeClipboard from 'tinymce/core/api/FakeClipboard';

type RowElement = HTMLTableRowElement | HTMLTableColElement;

const tableTypeBase = 'x-tinymce/dom-table-';
const tableTypeRow = tableTypeBase + 'rows';
const tableTypeColumn = tableTypeBase + 'columns';

const setData = (items: Record<string, SugarElement<RowElement>[]>) => {
  const fakeClipboardItem = FakeClipboard.FakeClipboardItem(items);
  FakeClipboard.write([ fakeClipboardItem ]);
};

const getData = <T>(type: string): Optional<T[]> => {
  const items = FakeClipboard.read() ?? [];
  return Arr.findMap(items, (item) => Optional.from(item.getType<T[]>(type)));
};

const clearData = (type: string): void => {
  if (getData(type).isSome()) {
    FakeClipboard.clear();
  }
};

const setRows = (rowsOpt: Optional<SugarElement<RowElement>[]>): void => {
  rowsOpt.fold(
    clearRows,
    (rows) => setData({ [tableTypeRow]: rows })
  );
};

const getRows = (): Optional<SugarElement<RowElement>[]> =>
  getData(tableTypeRow);

const clearRows = (): void =>
  clearData(tableTypeRow);

const setColumns = (columnsOpt: Optional<SugarElement<RowElement>[]>): void => {
  columnsOpt.fold(
    clearColumns,
    (columns) => setData({ [tableTypeColumn]: columns })
  );
};

const getColumns = (): Optional<SugarElement<RowElement>[]> =>
  getData(tableTypeColumn);

const clearColumns = (): void =>
  clearData(tableTypeColumn);

export {
  setRows,
  getRows,
  clearRows,
  setColumns,
  getColumns,
  clearColumns
};
