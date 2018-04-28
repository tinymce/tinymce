import { RawAssertions } from '@ephox/agar';
import { Editor } from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import DomSerializer from 'tinymce/core/dom/DomSerializer';
import TrimHtml from 'tinymce/core/dom/TrimHtml';
import Zwsp from 'tinymce/core/text/Zwsp';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('browser.tinymce.core.dom.TrimHtmlTest', function () {
  const serializer = DomSerializer({}, new Editor('id', {}, EditorManager));

  RawAssertions.assertEq('Should be unchanged', '<p id="a" data-mce-abc="1">a</p>', TrimHtml.trimInternal(serializer, '<p id="a" data-mce-abc="1">a</p>'));
  RawAssertions.assertEq('Should not have internal attr', '<p>a</p>', TrimHtml.trimInternal(serializer, '<p data-mce-selected="1">a</p>'));
  RawAssertions.assertEq('Should trim zwsp', '<p>ab</p>', TrimHtml.trimInternal(serializer, '<p>a' + Zwsp.ZWSP + 'b</p>'));

  RawAssertions.assertEq('Should be unchanged', '<p id="a" data-mce-abc="1">a</p>', TrimHtml.trimExternal(serializer, '<p id="a" data-mce-abc="1">a</p>'));
  RawAssertions.assertEq('Should not have internal attr', '<p>a</p>', TrimHtml.trimExternal(serializer, '<p data-mce-selected="1">a</p>'));
  RawAssertions.assertEq('Should not have zwsp', '<p>ab</p>', TrimHtml.trimExternal(serializer, '<p>a' + Zwsp.ZWSP + 'b</p>'));
});
