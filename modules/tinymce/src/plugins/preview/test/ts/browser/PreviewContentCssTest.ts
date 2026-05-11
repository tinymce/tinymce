import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { CrossOrigin } from 'tinymce/core/api/OptionTypes';
import * as IframeContent from 'tinymce/plugins/preview/core/IframeContent';
import type { ContentCssResource } from 'tinymce/plugins/preview/core/Types';
import Plugin from 'tinymce/plugins/preview/Plugin';

describe('browser.tinymce.plugins.preview.PreviewContentCssTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'preview',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ]);

  const assertIframeHtmlContains = (editor: Editor, contentCssResources: ContentCssResource[], text: string) => {
    const actual = IframeContent.getPreviewHtml(editor, contentCssResources);
    const regexp = new RegExp(text);
    assert.match(actual, regexp, 'Should be the same html');
  };

  afterEach(() => {
    const editor = hook.editor();
    editor.options.set('content_css_cors', false);
    editor.options.set('crossorigin', Fun.constant(undefined));
  });

  it('TBA: Set content, set content_css_cors and assert link elements. Delete setting and assert crossOrigin attr is removed', () => {
    const editor = hook.editor();
    const contentCssUrl = editor.documentBaseURI.toAbsolute('/project/tinymce/js/tinymce/skins/content/default/content.css');
    const contentCssResources: ContentCssResource[] = [{ type: 'link', url: contentCssUrl }];

    editor.setContent('<p>hello world</p>');
    editor.options.set('content_css_cors', true);
    assertIframeHtmlContains(editor, contentCssResources, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}" crossorigin="anonymous">`);
    editor.options.set('content_css_cors', false);
    assertIframeHtmlContains(editor, contentCssResources, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}">`);
  });

  it('TINY-13190: Assert style elements for bundled content CSS', () => {
    const editor = hook.editor();
    const css = 'body { background: red }';
    const contentCssResources: ContentCssResource[] = [{ type: 'bundled', content: css }];

    editor.setContent('<p>hello world</p>');
    assertIframeHtmlContains(editor, contentCssResources, `<style type="text/css">${css}</style>`);
  });

  const crossOriginCases: Array<{ value: ReturnType<CrossOrigin>; expectedAttr: string }> = [
    { value: 'anonymous', expectedAttr: ' crossorigin="anonymous"' },
    { value: 'use-credentials', expectedAttr: ' crossorigin="use-credentials"' },
    { value: undefined, expectedAttr: '' }
  ];

  Arr.each(crossOriginCases, ({ value, expectedAttr }) => {
    it(`TINY-13171: crossorigin function returning ${value ?? 'undefined'} produces "${expectedAttr}"`, () => {
      const editor = hook.editor();
      const contentCssUrl = editor.documentBaseURI.toAbsolute('/project/tinymce/js/tinymce/skins/content/default/content.css');
      const contentCssResources: ContentCssResource[] = [{ type: 'link', url: contentCssUrl }];

      editor.setContent('<p>hello world</p>');
      editor.options.set('crossorigin', Fun.constant(value));
      assertIframeHtmlContains(editor, contentCssResources, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}"${expectedAttr}>`);
    });
  });

  it('TINY-13171: content_css_cors takes precedence over crossorigin', () => {
    const editor = hook.editor();
    const contentCssUrl = editor.documentBaseURI.toAbsolute('/project/tinymce/js/tinymce/skins/content/default/content.css');
    const contentCssResources: ContentCssResource[] = [{ type: 'link', url: contentCssUrl }];

    editor.setContent('<p>hello world</p>');
    editor.options.set('content_css_cors', true);
    editor.options.set('crossorigin', Fun.constant('use-credentials'));
    assertIframeHtmlContains(editor, contentCssResources, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}" crossorigin="anonymous">`);
  });
});
