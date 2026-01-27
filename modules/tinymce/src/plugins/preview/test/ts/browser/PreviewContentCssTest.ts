import { context, describe, it, before, after } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { McEditor, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { TinyMCE } from 'tinymce/core/api/Tinymce';
import * as IframeContent from 'tinymce/plugins/preview/core/IframeContent';
import Plugin from 'tinymce/plugins/preview/Plugin';

declare const tinymce: TinyMCE;

describe('browser.tinymce.plugins.preview.PreviewContentCssTest', () => {
  context('No bundling', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'preview',
      base_url: '/project/tinymce/js/tinymce',
      content_css: '/project/tinymce/js/tinymce/skins/content/default/content.css'
    }, [ Plugin ]);

    const assertIframeHtmlContains = (editor: Editor, text: string) => {
      const actual = IframeContent.getPreviewHtml(editor);
      const regexp = new RegExp(text);

      assert.match(actual, regexp, 'Should be the same html');
    };

    it('TBA: Set content, set content_css_cors and assert link elements. Delete setting and assert crossOrigin attr is removed', () => {
      const editor = hook.editor();
      const contentCssUrl = editor.documentBaseURI.toAbsolute('/project/tinymce/js/tinymce/skins/content/default/content.css');

      editor.setContent('<p>hello world</p>');
      editor.options.set('content_css_cors', true);
      assertIframeHtmlContains(editor, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}" crossorigin="anonymous">`);
      editor.options.set('content_css_cors', false);
      assertIframeHtmlContains(editor, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}">`);
    });
  });

  context('Bundling', () => {
    Arr.each([
      { label: 'Single bundled content CSS', contentCss: [ 'dark' ] },
      { label: 'Multiple bundled content CSS', contentCss: [ 'dark', 'default' ] },
    ], ({ label, contentCss }) => {
      context(label, () => {
        const baseUrl = '/project/tinymce/js/tinymce';
        const defaultSkinUiContentUrl = `${baseUrl}/skins/ui/oxide/content.js`;
        const settings = {
          plugins: 'preview',
          base_url: baseUrl,
          content_css: contentCss
        };

        const resourceKeys = Arr.map(contentCss, (item) => `content/${item}/content.css`);
        const resourceUrls = Arr.map(contentCss, (item) => `${baseUrl}/skins/content/${item}/content.js`);

        before(async () => {
          const scriptsLoaded = tinymce.ScriptLoader.loadScripts([ ...resourceUrls, defaultSkinUiContentUrl ])
            .catch((errors) => {
              assert.fail(`Unable to load scripts: ${errors}`);
            });
          await scriptsLoaded;

          for (const key of resourceKeys) {
            assert.isTrue(tinymce.Resource.has(key));
          }
        });

        after(() => {
          Arr.each(resourceUrls, (url) => tinymce.ScriptLoader.remove(url));
          Arr.each(resourceKeys, tinymce.Resource.unload);
        });

        it(`TINY-13190: Load bundled ${contentCss} in Preview Iframe`, async () => {
          const editor = await McEditor.pFromSettings<Editor>({
            ...settings
          });
          const cleanup = Fun.noop;

          for (const key of resourceKeys) {
            assert.include(IframeContent.getPreviewHtml(editor), `<style type="text/css">${tinymce.Resource.get(key)}</style>`);
          }

          McEditor.remove(editor);
          cleanup();
        });
      });
    });
  });
});
