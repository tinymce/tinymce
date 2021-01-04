import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { DomSerializerImpl } from 'tinymce/core/dom/DomSerializerImpl';
import * as TrimHtml from 'tinymce/core/dom/TrimHtml';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.dom.TrimHtmlTest', () => {
  it('trimInternal', () => {
    const serializer = DomSerializerImpl({}, new Editor('id', {}, EditorManager));
    assert.equal(TrimHtml.trimInternal(serializer, '<p id="a" data-mce-abc="1">a</p>'), '<p id="a" data-mce-abc="1">a</p>', 'Should be unchanged');
    assert.equal(TrimHtml.trimInternal(serializer, '<p data-mce-selected="1">a</p>'), '<p>a</p>', 'Should not have internal attr');
    assert.equal(TrimHtml.trimInternal(serializer, '<p>a' + Zwsp.ZWSP + 'b</p>'), '<p>ab</p>', 'Should trim zwsp');
  });

  it('trimExternal', () => {
    const serializer = DomSerializerImpl({}, new Editor('id', {}, EditorManager));
    assert.equal(TrimHtml.trimExternal(serializer, '<p id="a" data-mce-abc="1">a</p>'), '<p id="a" data-mce-abc="1">a</p>', 'Should be unchanged');
    assert.equal(TrimHtml.trimExternal(serializer, '<p data-mce-selected="1">a</p>'), '<p>a</p>', 'Should not have internal attr');
    assert.equal(TrimHtml.trimExternal(serializer, '<p>a' + Zwsp.ZWSP + 'b</p>'), '<p>ab</p>', 'Should not have zwsp');
  });
});
