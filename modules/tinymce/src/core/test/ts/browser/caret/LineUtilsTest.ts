import { describe, it } from '@ephox/bedrock-client';
import { Insert, InsertAll, Remove, SelectorFind, SugarBody, SugarElement, SugarLocation } from '@ephox/sugar';
import { assert } from 'chai';

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

describe('browser.tinymce.core.LineUtilsTest', () => {
  it('findClosestClientRect', () => {
    assert.deepEqual(LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(30, 10, 10, 10) ], 15), rect(10, 10, 10, 10));
    assert.deepEqual(LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(30, 10, 10, 10) ], 27), rect(30, 10, 10, 10));
    assert.deepEqual(LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(30, 10, 10, 10) ], 23), rect(10, 10, 10, 10));
    assert.deepEqual(LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(20, 10, 10, 10) ], 13), rect(10, 10, 10, 10));
  });

  it('findLineNodeRects', () => {
    const container = SugarElement.fromTag('div');
    const para = SugarElement.fromHtml('<p>Paragraph with content</p>');
    const multiLinePara = SugarElement.fromHtml('<p>Multiple line <br>paragraph with content</p>');
    const table = SugarElement.fromHtml('<table border="1"><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>');
    const paraWithCef = SugarElement.fromHtml('<p>Before <span contenteditable="false">Noneditable</span> After</p>');
    const cef = SelectorFind.descendant(paraWithCef, 'span').getOrDie();
    const paraWithVideo = SugarElement.fromHtml('<p>Before <video controls="controls"><source src="custom/video.mp4" /></video> After</p>');
    const video = SelectorFind.descendant(paraWithVideo, 'video').getOrDie();
    InsertAll.append(container, [ para, multiLinePara, table, paraWithCef, paraWithVideo ]);
    Insert.append(SugarBody.body(), container);

    const paraLines = LineUtils.findLineNodeRects(container.dom, getClientRects([ para.dom.firstChild ])[0]);
    const multiParaLines = LineUtils.findLineNodeRects(container.dom, getClientRects([ multiLinePara.dom.lastChild ])[0]);
    const tableLines = LineUtils.findLineNodeRects(container.dom, getClientRects([ table.dom ])[0], false);
    const tableLinesWithChildren = LineUtils.findLineNodeRects(container.dom, getClientRects([ table.dom ])[0]);
    const cefLines = LineUtils.findLineNodeRects(container.dom, getClientRects([ cef.dom ])[0]);
    const videoLines = LineUtils.findLineNodeRects(container.dom, getClientRects([ video.dom ])[0]);

    assert.lengthOf(paraLines, 1, 'Should only find one line rect for a para');
    assert.lengthOf(multiParaLines, 1, 'Should only find one line rect for a multiline para');
    assert.lengthOf(tableLines, 1, 'Should only find one line rect for a table');
    assert.lengthOf(tableLinesWithChildren, 5, 'Should find multiple line rects for a table plus children');
    assert.lengthOf(cefLines, 3, 'Should find multiple line rects for an inline cef element');
    assert.lengthOf(videoLines, 3, 'Should find multiple line rects for a video element');

    Remove.remove(container);
  });

  it('TINY-7736: Nested CEF element within table should prefer the cef element', () => {
    const container = SugarElement.fromTag('div');
    const table = SugarElement.fromHtml('<table style="width: 100px;"><tbody><tr><td>1</td><td><div contenteditable="false">2</div></td></tr></tbody></table>');
    const cef = SelectorFind.descendant(table, 'div').getOrDie();
    Insert.append(container, table);
    Insert.append(SugarBody.body(), container);
    const cefPos = SugarLocation.absolute(cef);

    const result = LineUtils.closestFakeCaret(container.dom, cefPos.left - 10, cefPos.top + 5);
    assert.equal(result.node, cef.dom, 'Should be the cef element');
    assert.isTrue(result.before, 'Should be placed before');

    Remove.remove(container);
  });
});
