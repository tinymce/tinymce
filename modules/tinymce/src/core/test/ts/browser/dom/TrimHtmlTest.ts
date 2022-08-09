import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Schema from 'tinymce/core/api/html/Schema';
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

  it('findMatchingEndTagIndex', () => {
    const testFindMatchingEndTag = (html: string, startIndex: number, expectedIndex: number) => {
      assert.equal(TrimHtml.findMatchingEndTagIndex(Schema({}), html, startIndex), expectedIndex);
    };

    testFindMatchingEndTag('<b>', 3, 3);
    testFindMatchingEndTag('<img>', 3, 3);
    testFindMatchingEndTag('<b></b>', 3, 7);
    testFindMatchingEndTag('<b><img></b>', 3, 12);
    testFindMatchingEndTag('<tag                                               ', 0, 0);
    testFindMatchingEndTag('<b><!-- </b> --></b>', 3, 20);
    testFindMatchingEndTag('<span><b><i>a<img>b</i><b>c</b></b></span>', 9, 35);
    testFindMatchingEndTag('<!-- Mismatched " --></p><div>Closing " </div>', 0, 25);
    testFindMatchingEndTag('<!bogus comment ></p><!-- Good comment for good measure -->', 0, 21);
    testFindMatchingEndTag('<!--comment--></p><!-- extra comment -->', 0, 18);
    testFindMatchingEndTag('<!-- comments are allowed > symbols and fake </html> --></p><!-- extra comment -->', 0, 60);
  });
});
