import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

describe('browser.tinymce.plugins.media.SanitizationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const runTest = (testCase: { inputHtml: string; expectedHtml: string }) => {
    const editor = hook.editor();
    editor.setContent(testCase.inputHtml);
    TinyAssertions.assertContent(editor, testCase.expectedHtml);
  };

  it('TINY-14357: Event attributes should not be allowed', () => runTest({
    inputHtml: '<p data-mce-object="a" data-mce-p-href="#" data-mce-p-onclick="alert(1)">x</p>',
    expectedHtml: '<a href="#"></a>'
  }));

  it('TINY-14357: javascript urls in links should not be allowed', () => runTest({
    inputHtml: '<p data-mce-object="a" data-mce-p-href="javascript:alert(1)">x</p>',
    expectedHtml: '<a></a>'
  }));

  it('TINY-14357: javascript urls in images should not be allowed', () => runTest({
    inputHtml: '<p data-mce-object="img" data-mce-p-src="javascript:alert(1)">x</p>',
    expectedHtml: '<img>'
  }));

  it('TINY-14357: javascript urls in object should not be allowed', () => runTest({
    inputHtml: '<p data-mce-object="object" data-mce-p-data="javascript:alert(1)">x</p>',
    expectedHtml: '<object></object>'
  }));

  it('TINY-14357: scripts as data-mce-object should not be allowed', () => runTest({
    inputHtml: '<p data-mce-object="script" data-mce-html="alert(1)">x</p>',
    expectedHtml: ''
  }));

  it('TINY-14357: video with javascript urls should not be allowed', () => runTest({
    inputHtml: '<p data-mce-object="video" data-mce-p-src="javascript:alert(1)">x</p>',
    expectedHtml: '<video></video>'
  }));

  it('TINY-14357: video with event attributes should not be allowed', () => runTest({
    inputHtml: '<p data-mce-object="video" data-mce-p-src="about:blank" data-mce-p-onclick="alert(1)">x</p>',
    expectedHtml: '<video src="about:blank"></video>'
  }));

  it('TINY-14357: video element with valid properties and inner html should still work', () => runTest({
    inputHtml: `<p data-mce-object="video" data-mce-p-src="about:blank" data-mce-html='<a href="#">Unsupported content</a>'>x</p>`,
    expectedHtml: '<video src="about:blank"><a href="#">Unsupported content</a></video>'
  }));

  it('TINYMCE-14932: video element with onerror handler should not execute', () => runTest({
    inputHtml: `<span data-mce-object="video" data-mce-p-src="/missing.mp4" data-mce-p-onerror="throw Error('XSS')">x</span>`,
    expectedHtml: '<p><video src="/missing.mp4"></video></p>'
  }));

  it('TINYMCE-14932: audio element with onerror handler should not execute', () => runTest({
    inputHtml: `<span data-mce-object="audio" data-mce-p-src="/missing.mp3" data-mce-p-onerror="throw Error('XSS')">x</span>`,
    expectedHtml: '<p><audio src="/missing.mp3"></audio></p>'
  }));

  it('TINYMCE-14932: img element with onerror handler should not execute', () => runTest({
    inputHtml: `<span data-mce-object="img" data-mce-p-src="/missing.jpg" data-mce-p-onerror="throw Error('XSS')">x</span>`,
    expectedHtml: '<p><img src="/missing.jpg"></p>'
  }));
});
