import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { DomSerializer } from 'tinymce/core/dom/DomSerializer';
import * as TrimHtml from 'tinymce/core/dom/TrimHtml';
import * as Zwsp from 'tinymce/core/text/Zwsp';
import { Assert, UnitTest } from '@ephox/bedrock-client';

UnitTest.test('browser.tinymce.core.dom.TrimHtmlTest', function () {
  const serializer = DomSerializer({}, new Editor('id', {}, EditorManager));

  Assert.eq('Should be unchanged', '<p id="a" data-mce-abc="1">a</p>', TrimHtml.trimInternal(serializer, '<p id="a" data-mce-abc="1">a</p>'));
  Assert.eq('Should not have internal attr', '<p>a</p>', TrimHtml.trimInternal(serializer, '<p data-mce-selected="1">a</p>'));
  Assert.eq('Should trim zwsp', '<p>ab</p>', TrimHtml.trimInternal(serializer, '<p>a' + Zwsp.ZWSP + 'b</p>'));

  Assert.eq('Should be unchanged', '<p id="a" data-mce-abc="1">a</p>', TrimHtml.trimExternal(serializer, '<p id="a" data-mce-abc="1">a</p>'));
  Assert.eq('Should not have internal attr', '<p>a</p>', TrimHtml.trimExternal(serializer, '<p data-mce-selected="1">a</p>'));
  Assert.eq('Should not have zwsp', '<p>ab</p>', TrimHtml.trimExternal(serializer, '<p>a' + Zwsp.ZWSP + 'b</p>'));
});
