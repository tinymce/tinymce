import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as InternalHtml from 'tinymce/plugins/paste/core/InternalHtml';

describe('atomic.tinymce.plugins.paste.InternalHtmlTest', () => {
  it('mark', () => {
    assert.equal(InternalHtml.mark('abc'), '<!-- x-tinymce/html -->abc');
  });

  it('unmark', () => {
    assert.equal(InternalHtml.unmark('<!-- x-tinymce/html -->abc'), 'abc');
    assert.equal(InternalHtml.unmark('abc<!-- x-tinymce/html -->'), 'abc');
  });

  it('isMarked', () => {
    assert.isTrue(InternalHtml.isMarked('<!-- x-tinymce/html -->abc'));
    assert.isTrue(InternalHtml.isMarked('abc<!-- x-tinymce/html -->'));
    assert.isFalse(InternalHtml.isMarked('abc'));
  });

  it('internalHtmlMime', () => {
    assert.equal(InternalHtml.internalHtmlMime(), 'x-tinymce/html');
  });
});
