import { assert, UnitTest } from '@ephox/bedrock-client';
import * as InternalHtml from 'tinymce/plugins/paste/core/InternalHtml';

UnitTest.test('atomic.tinymce.plugins.paste.InternalHtmlTest', () => {
  const testMark = function () {
    assert.eq('<!-- x-tinymce/html -->abc', InternalHtml.mark('abc'));
  };

  const testUnmark = function () {
    assert.eq('abc', InternalHtml.unmark('<!-- x-tinymce/html -->abc'));
    assert.eq('abc', InternalHtml.unmark('abc<!-- x-tinymce/html -->'));
  };

  const testIsMarked = function () {
    assert.eq(true, InternalHtml.isMarked('<!-- x-tinymce/html -->abc'));
    assert.eq(true, InternalHtml.isMarked('abc<!-- x-tinymce/html -->'));
    assert.eq(false, InternalHtml.isMarked('abc'));
  };

  const testInternalHtmlMime = function () {
    assert.eq('x-tinymce/html', InternalHtml.internalHtmlMime());
  };

  testMark();
  testUnmark();
  testIsMarked();
  testInternalHtmlMime();
});
