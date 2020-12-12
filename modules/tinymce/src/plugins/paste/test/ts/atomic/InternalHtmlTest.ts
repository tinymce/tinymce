import { assert, UnitTest } from '@ephox/bedrock-client';
import * as InternalHtml from 'tinymce/plugins/paste/core/InternalHtml';

UnitTest.test('atomic.tinymce.plugins.paste.InternalHtmlTest', () => {
  const testMark = () => {
    assert.eq('<!-- x-tinymce/html -->abc', InternalHtml.mark('abc'));
  };

  const testUnmark = () => {
    assert.eq('abc', InternalHtml.unmark('<!-- x-tinymce/html -->abc'));
    assert.eq('abc', InternalHtml.unmark('abc<!-- x-tinymce/html -->'));
  };

  const testIsMarked = () => {
    assert.eq(true, InternalHtml.isMarked('<!-- x-tinymce/html -->abc'));
    assert.eq(true, InternalHtml.isMarked('abc<!-- x-tinymce/html -->'));
    assert.eq(false, InternalHtml.isMarked('abc'));
  };

  const testInternalHtmlMime = () => {
    assert.eq('x-tinymce/html', InternalHtml.internalHtmlMime());
  };

  testMark();
  testUnmark();
  testIsMarked();
  testInternalHtmlMime();
});
