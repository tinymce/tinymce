import { assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { Html, Insert, SugarElement } from '@ephox/sugar';
import { CellSpan } from 'ephox/snooker/api/Generators';
import * as TableFill from 'ephox/snooker/api/TableFill';

UnitTest.test('CloneFormatsTest', function () {
  const doc = SugarElement.fromDom(document);
  const noCloneFormats = Optional.some([] as string[]);
  const cloneTableFill = TableFill.cellOperations(Fun.noop, doc, Optional.none());
  const noCloneTableFill = TableFill.cellOperations(Fun.noop, doc, noCloneFormats);

  const cellElement = SugarElement.fromTag('td');
  const cellContent = SugarElement.fromHtml('<strong contenteditable="false"><em>stuff</em></strong>');
  Insert.append(cellElement, cellContent);
  const cell: CellSpan = {
    element: cellElement,
    colspan: 1,
    rowspan: 1
  };

  const clonedCell = cloneTableFill.cell(cell);

  assert.eq('<td><strong><em><br></em></strong></td>', Html.getOuter(clonedCell));

  const noClonedCell = noCloneTableFill.cell(cell);
  assert.eq('<td><br></td>', Html.getOuter(noClonedCell));
});
