import { assert, UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { Element, Html, Insert } from '@ephox/sugar';
import TableFill from 'ephox/snooker/api/TableFill';

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

