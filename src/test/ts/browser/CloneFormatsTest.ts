import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import TableFill from 'ephox/snooker/api/TableFill';
import { Insert } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('CloneFormatsTest', function() {
  var doc = document;
  var cloneFormats = Option.none();
  var noCloneFormats = Option.some([]);
  var cloneTableFill = TableFill.cellOperations(Fun.noop, doc, cloneFormats);
  var noCloneTableFill = TableFill.cellOperations(Fun.noop, doc, noCloneFormats);

  var cellElement = Element.fromTag('td');
  var cellContent = Element.fromHtml('<strong contenteditable="false"><em>stuff</em></strong>');
  Insert.append(cellElement, cellContent);
  var cell = {
    element: Fun.constant(cellElement),
    colspan: Fun.constant(1)
  };

  var clonedCell = cloneTableFill.cell(cell);

  assert.eq('<td><strong><em><br></em></strong></td>', Html.getOuter(clonedCell));

  var noClonedCell = noCloneTableFill.cell(cell);
  assert.eq('<td><br></td>', Html.getOuter(noClonedCell));
});

