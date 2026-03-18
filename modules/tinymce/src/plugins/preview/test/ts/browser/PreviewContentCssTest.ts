import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
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
});
