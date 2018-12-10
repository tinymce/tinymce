import { RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import EditorManager from 'tinymce/core/api/EditorManager';
import { Editor } from 'tinymce/core/api/Editor';
import { appendContentCssFromSettings } from 'tinymce/core/init/ContentCss';

UnitTest.test('browser.tinymce.core.init.ContentCssTest', () => {
  const baseUrl = EditorManager.documentBaseURL.replace(/\/$/, '');
  const skinsBaseUrl = EditorManager.baseURL + '/skins/content';

  const testContentCss = (label: string, expectedContentCss: string[], inputContentCss: string[] | string | boolean) => {
    const editor = new Editor('id', {
      content_css: inputContentCss
    }, EditorManager);

    appendContentCssFromSettings(editor);

    RawAssertions.assertEq(label, expectedContentCss, editor.contentCSS);
  };

  testContentCss('Expected empty array on empty input', [], []);
  testContentCss('Expected empty array on boolean false value', [], false);
  testContentCss('Expected array with absolute url from .css file name', [`${baseUrl}/test.css`], 'test.css');
  testContentCss('Expected array with absolute url from relative string', [`${baseUrl}/content/test.css`], '/content/test.css');
  testContentCss('Expected array with absolute url from array with relative string', [`${baseUrl}/content/test.css`], ['/content/test.css']);
  testContentCss('Expected array with two absolute urls from an array of relative strings',
    [`${baseUrl}/content/a.css`, `${baseUrl}/content/b.css`],
    ['/content/a.css', '/content/b.css']
  );
  testContentCss('Expected array with absolute url from absolute string', ['http://localhost/a/b/test.css'], 'http://localhost/a/b/test.css');
  testContentCss('Expected array with absolute url from string with skin name', [`${skinsBaseUrl}/document`], 'document');
  testContentCss('Expected array with absolute url from array with skin name', [`${skinsBaseUrl}/document`], ['document']);
  testContentCss('Expected array with absolute url from string with skin name with dash', [`${skinsBaseUrl}/business-letter`], 'business-letter');
  testContentCss('Expected empty array on empty input', [], []);
});
