import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import * as IframeContent from 'tinymce/plugins/preview/core/IframeContent';
import type { ContentCssResource } from 'tinymce/plugins/preview/core/Types';
import Plugin from 'tinymce/plugins/preview/Plugin';

describe('browser.tinymce.plugins.preview.PreviewContentStyleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'preview',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const assertIframeContains = (editor: Editor, contentCssResources: ContentCssResource[], text: string, shouldMatch: boolean) => {
    const actual = IframeContent.getPreviewHtml(editor, contentCssResources);
    const regexp = new RegExp(text);

    if (shouldMatch) {
      assert.match(actual, regexp, 'Should be the same html');
    } else {
      assert.notMatch(actual, regexp, 'Should not be the same html');
    }
  };

  const assertIframeHtmlContains = (editor: Editor, contentCssResources: ContentCssResource[], text: string) => assertIframeContains(editor, contentCssResources, text, true);

  const assertIframeHtmlNotContains = (editor: Editor, contentCssResources: ContentCssResource[], text: string) => assertIframeContains(editor, contentCssResources, text, false);

  it('TBA: Set content, set style setting and assert content and style. Delete style and assert style is removed', () => {
    const editor = hook.editor();
    editor.setContent('<p>hello world</p>');
    editor.options.set('content_style', 'p {color: blue;}');
    assertIframeHtmlContains(editor, [], '<style type="text/css">p {color: blue;}</style>');
    editor.options.unset('content_style');
    assertIframeHtmlNotContains(editor, [], '<style type="text/css">p {color: blue;}</style>');
  });

  it('TINY-6529: Set content, set style settings and assert content and styles. content_style should take precedence.', () => {
    const editor = hook.editor();
    const contentCssUrl = editor.documentBaseURI.toAbsolute('/project/tinymce/js/tinymce/skins/content/default/content.css');
    const contentCssResources: ContentCssResource[] = [{ type: 'link', url: contentCssUrl }];
    editor.setContent('<p>hello world</p>');
    editor.options.set('content_css_cors', true);
    editor.options.set('content_style', 'p {color: blue;}');
    assertIframeHtmlContains(editor, contentCssResources, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}" crossorigin="anonymous"><style type="text/css">p {color: blue;}</style>`);
  });
});
