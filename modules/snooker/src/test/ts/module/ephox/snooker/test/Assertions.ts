import { Assertions } from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';
import { Arr, Optional, Optionals } from '@ephox/katamari';
import { Attribute, Css, Hierarchy, Html, Insert, Remove, SelectorFilter, SugarBody, SugarElement, Traverse } from '@ephox/sugar';

import * as TableOperations from 'ephox/snooker/api/TableOperations';
import { TableSection } from 'ephox/snooker/api/TableSection';
import { TargetElement, TargetPaste, TargetPasteRows, TargetSelection, OperationCallback } from 'ephox/snooker/model/RunOperation';
import * as Bridge from 'ephox/snooker/test/Bridge';

interface TargetLocation {
  readonly section: number;
  readonly row: number;
  readonly column: number;
}

interface ExpCell {
  readonly section: number;
  readonly row: number;
  readonly column: number;
}

const makeContainer = () =>
  SugarElement.fromHtml<HTMLDivElement>('<div contenteditable="true"></div>');

const checkOld = (
  label: string,
  optExpCell: Optional<ExpCell>,
  expectedHtml: string,
  input: string,
  operation: OperationCallback<TargetElement>,
  section: number,
  row: number,
  column: number,
  tableSection?: TableSection
): void => {
  const table = SugarElement.fromHtml<HTMLTableElement>(input);
  const container = makeContainer();
  Insert.append(container, table);
  Insert.append(SugarBody.body(), container);
  const result = operation(table, {
    element: Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie(label + ': could not find element')
  }, Bridge.generators, { section: tableSection });

  optExpCell.each((expCell) => {
    const actualPath = Hierarchy.path(
      table,
      result.getOrDie(label + ': could not get result').cursor.getOrDie(label + ': could not find cursor')
    ).getOrDie(label + ': could not find path');
    Assert.eq('', [ expCell.section, expCell.row, expCell.column ], actualPath);
  });

  // Let's get rid of size information.
  const all = [ table ].concat(SelectorFilter.descendants(table, 'td,th'));
  Arr.each(all, (elem) => Css.remove(elem, 'width') );

  Assertions.assertHtml(label, expectedHtml, Html.getOuter(table));
  Remove.remove(container);
  // Ensure all the resize bars are destroyed before of running the next test.
};

const checkOldMultiple = (
  label: string,
  optExpCell: Optional<ExpCell>,
  expectedHtml: string,
  input: string,
  operation: OperationCallback<TargetSelection>,
  paths: TargetLocation[],
  tableSection?: TableSection
): void => {
  const table = SugarElement.fromHtml<HTMLTableElement>(input);
  const container = makeContainer();
  Insert.append(container, table);
  Insert.append(SugarBody.body(), container);
  const result = operation(table,
    {
      selection: Arr.map(paths, (path) =>
        Hierarchy.follow(table, [ path.section, path.row, path.column, 0 ]).getOrDie(label + ': could not follow path')
      )
    },
    Bridge.generators,
    { section: tableSection }
  );

  optExpCell.each((expCell) => {
    const actualPath = Hierarchy.path(
      table,
      result.getOrDie(label + ': could not get result').cursor.getOrDie(label + ': could not find cursor')
    ).getOrDie(label + ': could not find path');
    Assert.eq('', [ expCell.section, expCell.row, expCell.column ], actualPath);
  });

  // Let's get rid of size information.
  const all = [ table ].concat(SelectorFilter.descendants(table, 'td,th'));
  Arr.each(all, (elem) => Css.remove(elem, 'width') );
  Assertions.assertHtml(label, expectedHtml, Html.getOuter(table));
  Remove.remove(container);
  // Ensure all the resize bars are destroyed before of running the next test.
};

const checkPaste = (
  label: string,
  expectedHtml: string,
  input: string,
  pasteHtml: string,
  operation: OperationCallback<TargetPasteRows>,
  section: number,
  row: number,
  column: number
): void => {
  const table = SugarElement.fromHtml<HTMLTableElement>(input);
  const container = makeContainer();
  Insert.append(container, table);
  Insert.append(SugarBody.body(), container);

  const pasteTable = SugarElement.fromHtml<HTMLTableElement>('<table><tbody>' + pasteHtml + '</tbody></table>');
  operation(
    table,
    {
      selection: [ Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie(label + ': could not follow selection') ],
      clipboard: SelectorFilter.descendants(pasteTable, 'tr'),
      generators: Bridge.pasteGenerators
    },
    Bridge.generators
  );

  Assertions.assertHtml(label, expectedHtml, Html.getOuter(table));
  Remove.remove(container);
  // Ensure all the resize bars are destroyed before of running the next test.
};

const checkPasteRaw = (
  label: string,
  expectedHtml: string,
  inputTable: string,
  pastedTableHTML: string,
  operation: OperationCallback<TargetPaste>,
  section: number,
  row: number,
  column: number
): void => {
  const table = SugarElement.fromHtml<HTMLTableElement>(inputTable);
  const container = makeContainer();
  Insert.append(container, table);
  Insert.append(SugarBody.body(), container);

  const pasteTable = SugarElement.fromHtml<HTMLTableElement>(pastedTableHTML);
  operation(
    table,
    {
      element: Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie(label + ': could not follow selection'),
      clipboard: pasteTable,
      generators: Bridge.pasteGenerators
    },
    Bridge.generators
  );

  Assertions.assertHtml(label, expectedHtml, Html.getOuter(table));
  Remove.remove(container);
  // Ensure all the resize bars are destroyed before of running the next test.
};

const checkStructure = (
  expCell: ExpCell,
  expected: string[][],
  input: string,
  operation: OperationCallback<TargetElement>,
  section: number,
  row: number,
  column: number
): void => {
  const table = SugarElement.fromHtml<HTMLTableElement>(input);
  const container = makeContainer();
  Insert.append(container, table);
  Insert.append(SugarBody.body(), container);
  const result = operation(table, {
    element: Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie()
  }, Bridge.generators);

  const actualPath = Hierarchy.path(table, result.getOrDie().cursor.getOrDie()).getOrDie('could not find path');
  Assert.eq('', [ expCell.section, expCell.row, expCell.column ], actualPath);

  // Presence.assertHas(expected, table, 'checking the operation on table: ' + Html.getOuter(table));
  const rows = SelectorFilter.descendants(table, 'tr');
  const actual = Arr.map(rows, (r) => {
    const cells = SelectorFilter.descendants<HTMLTableCellElement>(r, 'td,th');
    return Arr.map(cells, Html.get);
  });
  Assert.eq('', expected, actual);
  Remove.remove(container);
};

const checkDelete = (
  label: string,
  optExpCell: Optional<ExpCell>,
  optExpectedHtml: Optional<string>,
  input: string,
  operation: OperationCallback<TargetSelection>,
  cells: ExpCell[]
): void => {
  const table = SugarElement.fromHtml<HTMLTableElement>(input);
  const container = makeContainer();
  Insert.append(container, table);
  Insert.append(SugarBody.body(), container);
  const cellz = Arr.map(cells, (cell) =>
    Hierarchy.follow(table, [ cell.section, cell.row, cell.column, 0 ]).getOrDie(label + ': could not find cell')
  );

  const result = operation(table, {
    selection: cellz
  }, Bridge.generators);

  // The operation might delete the whole table
  optExpCell.each((expCell) => {
    const actualPath = Hierarchy.path(
      table,
      result.getOrDie(label + ': could not get result').cursor.getOrDie(label + ': could not find cursor')
    ).getOrDie(label + ': could not find path');
    Assert.eq('', [ expCell.section, expCell.row, expCell.column ], actualPath);
  });

  // Let's get rid of size information.
  const all = [ table ].concat(SelectorFilter.descendants(table, 'td,th'));
  Arr.each(all, (elem) => Css.remove(elem, 'width') );

  optExpectedHtml.fold(() => {
    // the result of a delete operation can be by definition the deletion of the table itself.
    // If that is the case our table should not have any parent element because has been removed
    // from the DOM
    Assertions.assertEq(label + ': The table was expected to be removed from the DOM', false, Traverse.parent(table).isSome());

  }, (expectedHtml) => {
    Assertions.assertHtml(label, expectedHtml, Html.getOuter(table));
    Remove.remove(container);
  });

  // Ensure all the resize bars are destroyed before of running the next test.
};

const checkMerge = (
  label: string,
  expected: string,
  input: string,
  selection: Array<{ section: number; row: number; column: number }>,
  bounds: { startRow: number; startCol: number; finishRow: number; finishCol: number }
): void => {
  const table = SugarElement.fromHtml<HTMLTableElement>(input);
  const expectedDom = SugarElement.fromHtml(expected);
  const container = makeContainer();

  Insert.append(container, expectedDom);
  Insert.append(container, table);
  Insert.append(SugarBody.body(), container);

  const target = Bridge.targetStub(selection, bounds, table);
  const generators = Bridge.generators;

  TableOperations.mergeCells(table, target, generators);

  // Let's get rid of size information.
  const all = [ table ].concat(SelectorFilter.descendants(table, 'td,th'));
  Arr.each(all, (elem) => Css.remove(elem, 'width') );

  Assert.eq('', '1', Attribute.get(table, 'border'));
  // Get around ordering of attribute differences.
  Attribute.remove(table, 'border');
  Assertions.assertHtmlStructure(label, expected, Html.getOuter(table));

  Remove.remove(container);
};

const checkUnmerge = (
  label: string,
  expected: string,
  input: string,
  unmergablePaths: ExpCell[]
): void => {
  const table = SugarElement.fromHtml<HTMLTableElement>(input);
  const container = makeContainer();
  Insert.append(container, table);
  Insert.append(SugarBody.body(), container);
  const unmergables = Arr.map(unmergablePaths, (path) =>
    Hierarchy.follow(table, [ path.section, path.row, path.column ]) as Optional<SugarElement<HTMLTableCellElement>>
  );

  const unmergable = Optional.some(Optionals.cat(unmergables));

  TableOperations.unmergeCells(table, { unmergable }, Bridge.generators);
  // Presence.assertHas(expected, table, 'checking the operation on table: ' + Html.getOuter(table));

  // Let's get rid of size information.
  const all = [ table ].concat(SelectorFilter.descendants(table, 'td,th'));
  Arr.each(all, (elem) => Css.remove(elem, 'width') );

  Assertions.assertEq(label, expected, Html.getOuter(table));
  Remove.remove(container);
};

export {
  checkOld,
  checkOldMultiple,
  checkPaste,
  checkPasteRaw,
  checkStructure,
  checkDelete,
  checkMerge,
  checkUnmerge
};

