import { before, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { appendContentCssFromSettings } from 'tinymce/core/init/ContentCss';

describe('browser.tinymce.core.init.ContentCssTest', () => {
  let baseUrl: string;
  let skinsBaseUrl: string;

  before(() => {
    // Needs to be read here since other tests might mutate these globals before the tests gets executed
    baseUrl = EditorManager.documentBaseURL.replace(/\/$/, '');
    skinsBaseUrl = EditorManager.baseURL + '/skins/content';
  });

  const testContentCss = (expectedContentCss: string[], inputContentCss: string[] | string | boolean | undefined, inline: boolean = false) => {
    const editor = new Editor('id', {
      content_css: inputContentCss,
      inline
    }, EditorManager);

    appendContentCssFromSettings(editor);

    assert.deepEqual(editor.contentCSS, expectedContentCss);
  };

  it('Expected empty array on empty input', () => testContentCss([], []));
  it('Expected empty array on boolean false value', () => testContentCss([], false));
  it('Expected default content css on undefined value', () => testContentCss([ `${skinsBaseUrl}/default/content.css` ], undefined));
  it('Expected array with absolute url from .css file name', () => testContentCss([ `${baseUrl}/test.css` ], 'test.css'));
  it('Expected array with absolute url from relative string', () => testContentCss([ `${baseUrl}/content/test.css` ], '/content/test.css'));
  it('Expected array with absolute url from array with relative string', () => testContentCss([ `${baseUrl}/content/test.css` ], [ '/content/test.css' ]));
  it('Expected array with two absolute urls from an array of relative strings', () => testContentCss(
    [ `${baseUrl}/content/a.css`, `${baseUrl}/content/b.css` ],
    [ '/content/a.css', '/content/b.css' ]
  ));
  it('Expected array with absolute url from absolute string', () => testContentCss([ 'http://localhost/a/b/test.css' ], 'http://localhost/a/b/test.css'));
  it('Expected array with absolute url from string with skin name', () => testContentCss([ `${skinsBaseUrl}/document/content.css` ], 'document'));
  it('Expected array with absolute url from array with skin name', () => testContentCss([ `${skinsBaseUrl}/document/content.css` ], [ 'document' ]));
  it('Expected array with absolute url from string with skin name with dash', () => testContentCss([ `${skinsBaseUrl}/business-letter/content.css` ], 'business-letter'));
  it('Expected array with absolute url from a comma separated list of css files', () => testContentCss(
    [ `${baseUrl}/a.css`, `${baseUrl}/b.css` ],
    'a.css,b.css'
  ));

  it('Expected array without content skins for inline editors', () => testContentCss([ `${baseUrl}/document` ], 'document', true));
});
