import { assert, UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { Element, Html, Insert } from '@ephox/sugar';
import TableFill from 'ephox/snooker/api/TableFill';
import { CellSpan } from 'ephox/snooker/api/Generators';

UnitTest.test('CloneFormatsTest', function () {
  const doc = Element.fromDom(document);
  const noCloneFormats = Option.some([] as string[]);
  const cloneTableFill = TableFill.cellOperations(Fun.noop, doc, Option.none());
  const noCloneTableFill = TableFill.cellOperations(Fun.noop, doc, noCloneFormats);

  const cellElement = Element.fromTag('td');
  const cellContent = Element.fromHtml('<strong contenteditable="false"><em>stuff</em></strong>');
  Insert.append(cellElement, cellContent);
  const cell: CellSpan = {
    element: Fun.constant(cellElement),
    colspan: Fun.constant(1),
    rowspan: Fun.constant(1),
  };

  const clonedCell = cloneTableFill.cell(cell);

  assert.eq('<td><strong><em><br></em></strong></td>', Html.getOuter(clonedCell));

  const noClonedCell = noCloneTableFill.cell(cell);
  assert.eq('<td><br></td>', Html.getOuter(noClonedCell));
});
