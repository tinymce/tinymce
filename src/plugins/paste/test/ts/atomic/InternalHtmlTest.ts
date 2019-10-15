import InternalHtml from 'tinymce/plugins/paste/core/InternalHtml';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('atomic.tinymce.plugins.paste.InternalHtmlTest', function () {
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
