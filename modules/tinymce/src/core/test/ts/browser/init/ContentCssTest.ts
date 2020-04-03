import { Assert, UnitTest } from '@ephox/bedrock-client';
import EditorManager from 'tinymce/core/api/EditorManager';
import Editor from 'tinymce/core/api/Editor';
import { appendContentCssFromSettings } from 'tinymce/core/init/ContentCss';

UnitTest.test('browser.tinymce.core.init.ContentCssTest', () => {
  const baseUrl = EditorManager.documentBaseURL.replace(/\/$/, '');
  const skinsBaseUrl = EditorManager.baseURL + '/skins/content';

  const testContentCss = (label: string, expectedContentCss: string[], inputContentCss: string[] | string | boolean) => {
    const editor = new Editor('id', {
      content_css: inputContentCss
    }, EditorManager);

    appendContentCssFromSettings(editor);

    Assert.eq(label, expectedContentCss, editor.contentCSS);
  };

  testContentCss('Expected empty array on empty input', [], []);
  testContentCss('Expected empty array on boolean false value', [], false);
  testContentCss('Expected default content css on undefined value', [ `${skinsBaseUrl}/default/content.css` ], undefined);
  testContentCss('Expected array with absolute url from .css file name', [ `${baseUrl}/test.css` ], 'test.css');
  testContentCss('Expected array with absolute url from relative string', [ `${baseUrl}/content/test.css` ], '/content/test.css');
  testContentCss('Expected array with absolute url from array with relative string', [ `${baseUrl}/content/test.css` ], [ '/content/test.css' ]);
  testContentCss('Expected array with two absolute urls from an array of relative strings',
    [ `${baseUrl}/content/a.css`, `${baseUrl}/content/b.css` ],
    [ '/content/a.css', '/content/b.css' ]
  );
  testContentCss('Expected array with absolute url from absolute string', [ 'http://localhost/a/b/test.css' ], 'http://localhost/a/b/test.css');
  testContentCss('Expected array with absolute url from string with skin name', [ `${skinsBaseUrl}/document/content.css` ], 'document');
  testContentCss('Expected array with absolute url from array with skin name', [ `${skinsBaseUrl}/document/content.css` ], [ 'document' ]);
  testContentCss('Expected array with absolute url from string with skin name with dash', [ `${skinsBaseUrl}/business-letter/content.css` ], 'business-letter');
  testContentCss('Expected empty array on empty input', [], []);
  testContentCss('Expected array with absolute url from a comma separated list of css files',
    [ `${baseUrl}/a.css`, `${baseUrl}/b.css` ],
    'a.css,b.css'
  );

  const inlineEditor = new Editor('id', { content_css: 'document', inline: true }, EditorManager);
  appendContentCssFromSettings(inlineEditor);
  Assert.eq('Content skins should not load in inline mode', [ `${baseUrl}/document` ], inlineEditor.contentCSS);
});
