import { assert } from '@ephox/bedrock-client';
import { HTMLTableDataCellElement, HTMLTableElement, HTMLTableHeaderCellElement } from '@ephox/dom-globals';
import { Arr, Fun, Option, Options } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Body, Css, Element, Hierarchy, Html, Insert, Remove, SelectorFilter, Traverse } from '@ephox/sugar';
import { Generators, SimpleGenerators } from 'ephox/snooker/api/Generators';
import { ResizeDirection } from 'ephox/snooker/api/ResizeDirection';
import { ResizeWire } from 'ephox/snooker/api/ResizeWire';
import * as TableOperations from 'ephox/snooker/api/TableOperations';
import { RunOperationOutput, TargetElement, TargetPasteRows, TargetSelection } from 'ephox/snooker/model/RunOperation';
import { BarPositions, ColInfo } from 'ephox/snooker/resize/BarPositions';
import * as Bars from 'ephox/snooker/resize/Bars';
import * as Bridge from 'ephox/snooker/test/Bridge';

type Op<T> = (
  wire: ResizeWire,
  table: Element,
  target: T,
  generators: Generators,
  direction: BarPositions<ColInfo>
) => Option<RunOperationOutput>;

const checkOld = (
  expCell: { section: number; row: number; column: number },
  expectedHtml: string,
  input: string,
  operation: Op<TargetElement>,
  section: number,
  row: number,
  column: number,
  direction: BarPositions<ColInfo> = ResizeDirection.ltr
) => {
  const table = Element.fromHtml<HTMLTableElement>(input);
  Insert.append(Body.body(), table);
  const wire = ResizeWire.only(Body.body());
  const result = operation(wire, table, {
    element: Fun.constant(Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie())
  }, Bridge.generators, direction);

  const actualPath = Hierarchy.path(table, result.getOrDie().cursor().getOrDie()).getOrDie('could not find path');
  assert.eq([ expCell.section, expCell.row, expCell.column ], actualPath);

  // Presence.assertHas(expected, table, 'checking the operation on table: ' + Html.getOuter(table));

  // Let's get rid of size information.
  const all = [ table ].concat(SelectorFilter.descendants(table, 'td,th'));
  Arr.each(all, (elem) => Css.remove(elem, 'width') );

  assert.eq(expectedHtml, Html.getOuter(table));
  Remove.remove(table);
  // Ensure all the resize bars are destroyed before of running the next test.
  Bars.destroy(wire);
};

const checkPaste = (
  expectedHtml: string,
  input: string,
  pasteHtml: string,
  operation: Op<TargetPasteRows>,
  section: number,
  row: number,
  column: number,
  direction: BarPositions<ColInfo> = ResizeDirection.ltr
) => {
  const table = Element.fromHtml<HTMLTableElement>(input);
  Insert.append(Body.body(), table);
  const wire = ResizeWire.only(Body.body());

  const pasteTable = Element.fromHtml<HTMLTableElement>('<table><tbody>' + pasteHtml + '</tbody></table>');
  operation(
    wire,
    table,
    {
      selection: Fun.constant([ Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie() ]),
      clipboard: Fun.constant(SelectorFilter.descendants(pasteTable, 'tr')),
      // Impossible type! This might work in some restricted circumstances.
      generators: Fun.constant(Bridge.generators as SimpleGenerators)
    },
    Bridge.generators,
    direction
  );

  assert.eq(expectedHtml, Html.getOuter(table));
  Remove.remove(table);
  // Ensure all the resize bars are destroyed before of running the next test.
  Bars.destroy(wire);
};

const checkStructure = (
  expCell: { section: number; row: number; column: number},
  expected: string[][],
  input: string,
  operation: Op<TargetElement>,
  section: number,
  row: number,
  column: number,
  direction: BarPositions<ColInfo> = ResizeDirection.ltr
) => {
  const table = Element.fromHtml<HTMLTableElement>(input);
  Insert.append(Body.body(), table);
  const wire = ResizeWire.only(Body.body());
  const result = operation(wire, table, {
    element: Fun.constant(Hierarchy.follow(table, [ section, row, column, 0 ]).getOrDie())
  }, Bridge.generators, direction);

  const actualPath = Hierarchy.path(table, result.getOrDie().cursor().getOrDie()).getOrDie('could not find path');
  assert.eq([ expCell.section, expCell.row, expCell.column ], actualPath);

  // Presence.assertHas(expected, table, 'checking the operation on table: ' + Html.getOuter(table));
  const rows = SelectorFilter.descendants(table, 'tr');
  const actual = Arr.map(rows, (r) => {
    const cells = SelectorFilter.descendants<HTMLTableDataCellElement | HTMLTableHeaderCellElement>(r, 'td,th');
    return Arr.map(cells, Html.get);
  });
  assert.eq(expected, actual);
  Remove.remove(table);
  Bars.destroy(wire);
};

const checkDelete = (
  optExpCell: Option<{ section: number; row: number; column: number }>,
  optExpectedHtml: Option<{ ie: string; normal: string }>,
  input: string,
  operation: Op<TargetSelection>,
  cells: { section: number; row: number; column: number }[],
  platform: ReturnType<typeof PlatformDetection.detect>,
  direction: BarPositions<ColInfo> = ResizeDirection.ltr
) => {
  const table = Element.fromHtml<HTMLTableElement>(input);
  Insert.append(Body.body(), table);
  const wire = ResizeWire.only(Body.body());
  const cellz = Arr.map(cells, (cell) =>
    Hierarchy.follow(table, [ cell.section, cell.row, cell.column, 0 ]).getOrDie('Could not find cell')
  );

  const result = operation(wire, table, {
    selection: Fun.constant(cellz)
  }, Bridge.generators, direction);

  // The operation might delete the whole table
  optExpCell.each((expCell) => {
    const actualPath = Hierarchy.path(
      table,
      result.getOrDie().cursor().getOrDie('could not find cursor')
    ).getOrDie('could not find path');
    assert.eq([ expCell.section, expCell.row, expCell.column ], actualPath);
  });

  // Let's get rid of size information.
  const all = [ table ].concat(SelectorFilter.descendants(table, 'td,th'));
  Arr.each(all, (elem) => Css.remove(elem, 'width') );

  optExpectedHtml.fold(() => {
    // the result of a delete operation can be by definition the deletion of the table itself.
    // If that is the case our table should not have any parent element because has been removed
    // from the DOM
    assert.eq(false, Traverse.parent(table).isSome(), 'The table was expected to be removed from the DOM');

  }, (expectedHtml) => {
    if (platform.browser.isIE() || platform.browser.isEdge()) {
      assert.eq(expectedHtml.ie, Html.getOuter(table));
    } else {
      assert.eq(expectedHtml.normal, Html.getOuter(table));
    }
    Remove.remove(table);
  });

  // Ensure all the resize bars are destroyed before of running the next test.
  Bars.destroy(wire);
};

const checkMerge = (
  label: string,
  expected: string,
  input: string,
  selection: {section: number; row: number; column: number}[],
  bounds: {startRow: number; startCol: number; finishRow: number; finishCol: number},
  direction: BarPositions<ColInfo> = ResizeDirection.ltr
) => {
  const table = Element.fromHtml<HTMLTableElement>(input);
  const expectedDom = Element.fromHtml(expected);

  Insert.append(Body.body(), expectedDom);
  Insert.append(Body.body(), table);

  const wire = ResizeWire.only(Body.body());
  const target = Bridge.targetStub(selection, bounds, table);
  const generators = Bridge.generators;

  TableOperations.mergeCells(wire, table, target, generators, direction);

  // Let's get rid of size information.
  const all = [ table ].concat(SelectorFilter.descendants(table, 'td,th'));
  Arr.each(all, (elem) => Css.remove(elem, 'width') );

  assert.eq('1', Attr.get(table, 'border'));
  // Get around ordering of attribute differences.
  Attr.remove(table, 'border');
  assert.eq(expected, Html.getOuter(table));

  Remove.remove(table);
  Remove.remove(expectedDom);
  Bars.destroy(wire);
};

const checkUnmerge = (
  expected: string,
  input: string,
  unmergablePaths: { section: number; row: number; column: number }[],
  direction: BarPositions<ColInfo> = ResizeDirection.ltr
) => {
  const table = Element.fromHtml<HTMLTableElement>(input);
  Insert.append(Body.body(), table);
  const wire = ResizeWire.only(Body.body());
  const unmergables = Arr.map(unmergablePaths, (path) =>
    Hierarchy.follow(table, [ path.section, path.row, path.column ])
  );

  const unmergable = Option.some(Options.cat(unmergables));

  TableOperations.unmergeCells(wire, table, { unmergable: Fun.constant(unmergable) }, Bridge.generators, direction);
  // Presence.assertHas(expected, table, 'checking the operation on table: ' + Html.getOuter(table));

  // Let's get rid of size information.
  const all = [ table ].concat(SelectorFilter.descendants(table, 'td,th'));
  Arr.each(all, (elem) => Css.remove(elem, 'width') );

  assert.eq(expected, Html.getOuter(table));
  Remove.remove(table);
  Bars.destroy(wire);
};

export {
  checkOld,
  checkPaste,
  checkStructure,
  checkDelete,
  checkMerge,
  checkUnmerge
};
