import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Html, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Schema from 'tinymce/core/api/html/Schema';
import * as PaddingBr from 'tinymce/core/dom/PaddingBr';

describe('browser.tinymce.core.dom.PaddingBrTest', () => {
  const baseSchema = Schema();

  const testRemoveTrailingBr = (label: string, inputHtml: string, expectedHtml: string) => {
    const elm = SugarElement.fromHtml(inputHtml);
    PaddingBr.removeTrailingBr(elm);
    Assertions.assertHtml(label, expectedHtml, Html.getOuter(elm));
  };

  const testTrimBlockTrailingBr = (label: string, inputHtml: string, expectedHtml: string) => {
    const elm = SugarElement.fromHtml(inputHtml);
    PaddingBr.trimBlockTrailingBr(elm, baseSchema);
    Assertions.assertHtml(label, expectedHtml, Html.getOuter(elm));
  };

  it('removeTrailingBrs', () => {
    testRemoveTrailingBr('Should be untouched since it has no brs', '<p>a</p>', '<p>a</p>');
    testRemoveTrailingBr('Should be untouched since the br not at the edge of the tree', '<p>a<br>b</p>', '<p>a<br>b</p>');
    testRemoveTrailingBr('Should be untouched since the br not at the edge of the tree', '<p><b>a<br></b>b</p>', '<p><b>a<br></b>b</p>');
    testRemoveTrailingBr('Should remove trailing br 1', '<p>a<br></p>', '<p>a</p>');
    testRemoveTrailingBr('Should remove trailing br 2', '<p><b>a<br></b></p>', '<p><b>a</b></p>');
    testRemoveTrailingBr('Should remove trailing br 3', '<p><i><b>a<br></b></i></p>', '<p><i><b>a</b></i></p>');
    testRemoveTrailingBr('Should remove trailing br 4', '<p><b>a</b><br></p>', '<p><b>a</b></p>');
    testRemoveTrailingBr('Should be untouched since there is more than one br', '<p>a<br><br></p>', '<p>a<br><br></p>');
    testRemoveTrailingBr('Should be untouched since there is more than one br', '<p><b>a<br></b><br></p>', '<p><b>a<br></b><br></p>');
  });

  it('fillWithPaddingBr', () => {
    const elm = SugarElement.fromHtml('<p>a</p>');
    PaddingBr.fillWithPaddingBr(elm);
    Assertions.assertHtml('Should be padded with bogus br', '<p><br data-mce-bogus="1"></p>', Html.getOuter(elm));
  });

  it('isPaddedElement', () => {
    assert.isFalse(PaddingBr.isPaddedElement(SugarElement.fromHtml('<p>a</p>')), 'Should not be padded');
    assert.isFalse(PaddingBr.isPaddedElement(SugarElement.fromHtml('<p>\u00a0\u00a0</p>')), 'Should not be padded');
    assert.isFalse(PaddingBr.isPaddedElement(SugarElement.fromHtml('<p><br><br></p>')), 'Should not be padded');
    assert.isFalse(PaddingBr.isPaddedElement(SugarElement.fromHtml('<p></p>')), 'Should not be padded');
    assert.isTrue(PaddingBr.isPaddedElement(SugarElement.fromHtml('<p>\u00a0</p>')), 'Should be padded nbsp');
    assert.isTrue(PaddingBr.isPaddedElement(SugarElement.fromHtml('<p><br></p>')), 'Should be padded br');
  });

  it('trimPaddingBrs', () => {
    testTrimBlockTrailingBr('Should be untouched since it has no brs', '<div></div>', '<div></div>');
    testTrimBlockTrailingBr('Should be untouched since it has no brs', '<div><p>a</p></div>', '<div><p>a</p></div>');
    testTrimBlockTrailingBr('Should be without br since it is after a block', '<div><p>a</p><br></div>', '<div><p>a</p></div>');
    testTrimBlockTrailingBr('Should be untouched since it is multiple brs', '<div><p>a</p><br><br></div>', '<div><p>a</p><br><br></div>');
    testTrimBlockTrailingBr('Should be untouched since it is a br after an inline', '<div><b>a</b><br></div>', '<div><b>a</b><br></div>');
    testTrimBlockTrailingBr('Should be untouched since it is a br inside an inline', '<span><b>a</b><br></span>', '<span><b>a</b><br></span>');
  });
});
