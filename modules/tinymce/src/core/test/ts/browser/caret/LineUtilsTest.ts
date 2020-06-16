import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Body, Element, Insert, InsertAll, Remove, SelectorFind } from '@ephox/sugar';
import * as LineUtils from 'tinymce/core/caret/LineUtils';
import { getClientRects } from 'tinymce/core/dom/Dimensions';

const rect = (x: number, y: number, w: number, h: number) => ({
  left: x,
  top: y,
  bottom: y + h,
  right: x + w,
  width: w,
  height: h
});

UnitTest.test('browser.tinymce.core.LineUtilsTest - findClosestClientRect', () => {
  Assert.eq('', LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(30, 10, 10, 10) ], 15), rect(10, 10, 10, 10));
  Assert.eq('', LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(30, 10, 10, 10) ], 27), rect(30, 10, 10, 10));
  Assert.eq('', LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(30, 10, 10, 10) ], 23), rect(10, 10, 10, 10));
  Assert.eq('', LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(20, 10, 10, 10) ], 13), rect(10, 10, 10, 10));
});

UnitTest.test('browser.tinymce.core.LineUtilsTest - findLineNodeRects', () => {
  const container = Element.fromTag('div');
  const para = Element.fromHtml('<p>Paragraph with content</p>');
  const multiLinePara = Element.fromHtml('<p>Multiple line <br>paragraph with content</p>');
  const table = Element.fromHtml('<table border="1"><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>');
  const paraWithCef = Element.fromHtml('<p>Before <span contenteditable="false">Noneditable</span> After</p>');
  const cef = SelectorFind.descendant(paraWithCef, 'span').getOrDie();
  InsertAll.append(container, [ para, multiLinePara, table, paraWithCef ]);
  Insert.append(Body.body(), container);

  const paraLines = LineUtils.findLineNodeRects(container.dom(), getClientRects([ para.dom().firstChild ])[0]);
  const multiParaLines = LineUtils.findLineNodeRects(container.dom(), getClientRects([ multiLinePara.dom().lastChild ])[0]);
  const tableLines = LineUtils.findLineNodeRects(container.dom(), getClientRects([ table.dom() ])[0], false);
  const tableLinesWithChildren = LineUtils.findLineNodeRects(container.dom(), getClientRects([ table.dom() ])[0]);
  const cefLines = LineUtils.findLineNodeRects(container.dom(), getClientRects([ cef.dom() ])[0]);

  Assert.eq('Should only find one line rect for a para', 1, paraLines.length);
  Assert.eq('Should only find one line rect for a multiline para', 1, multiParaLines.length);
  Assert.eq('Should only find one line rect for a table', 1, tableLines.length);
  Assert.eq('Should find multiple line rects for a table plus children', 5, tableLinesWithChildren.length);
  Assert.eq('Should find multiple line rects for a cef element', 3, cefLines.length);

  Remove.remove(container);
});
