import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import type Editor from 'tinymce/core/api/Editor';
import * as IframeContent from 'tinymce/plugins/preview/core/IframeContent';
import Plugin from 'tinymce/plugins/preview/Plugin';

describe('browser.tinymce.plugins.preview.core.IframeContentTest', () => {
  const fakeComponentUrl1 = 'data:,' + encodeURIComponent(`console.log("test-component1 loaded");`);
  const fakeComponentUrl2 = 'data:,' + encodeURIComponent(`console.log("test-component2 loaded");`);

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'preview',
    base_url: '/project/tinymce/js/tinymce',
    content_css: '/project/tinymce/js/tinymce/skins/content/default/content.css',
    setup: (editor: Editor) => {
      editor.on('PreInit', () => {
        editor.schema.addCustomElements({
          'test-component1': { extends: 'span', componentUrl: fakeComponentUrl1 },
          'test-component2': { extends: 'span', componentUrl: fakeComponentUrl2 }
        });
      });
    }
  }, [ Plugin ]);

  it('TINY-13006: Should include the component script', () => {
    const editor = hook.editor();

    assert.include(
      IframeContent.getPreviewHtml(editor),
      `<script src="${fakeComponentUrl1}"></script>`,
      'Should include the component script with the url from fakeComponentUrl1'
    );

    assert.include(
      IframeContent.getPreviewHtml(editor),
      `<script src="${fakeComponentUrl2}"></script>`,
      'Should include the component script with the url from fakeComponentUrl2'
    );
  });

  it('TINY-13006: Should include the component script with crossorigin attribute', () => {
    const editor = hook.editor();

    ScriptLoader.ScriptLoader._setCrossOrigin(Fun.constant('anonymous'));

    assert.include(
      IframeContent.getPreviewHtml(editor),
      `<script src="${fakeComponentUrl1}" crossorigin="anonymous"></script>`,
      'Should include the component script with crossorigin attribute and the url from fakeComponentUrl1'
    );

    assert.include(
      IframeContent.getPreviewHtml(editor),
      `<script src="${fakeComponentUrl2}" crossorigin="anonymous"></script>`,
      'Should include the component script with crossorigin attribute and the url from fakeComponentUrl2'
    );

    ScriptLoader.ScriptLoader._setCrossOrigin(Fun.constant(undefined));
  });

  it('TINY-13006: Should include the component script with referrer attribute', () => {
    const editor = hook.editor();

    ScriptLoader.ScriptLoader._setReferrerPolicy('no-referrer');

    assert.include(
      IframeContent.getPreviewHtml(editor),
      `<script src="${fakeComponentUrl1}" referrerpolicy="no-referrer"></script>`,
      'Should include the component script with referrerpolicy attribute and the url from fakeComponentUrl1'
    );

    assert.include(
      IframeContent.getPreviewHtml(editor),
      `<script src="${fakeComponentUrl2}" referrerpolicy="no-referrer"></script>`,
      'Should include the component script with referrerpolicy attribute and the url from fakeComponentUrl2'
    );

    ScriptLoader.ScriptLoader._setReferrerPolicy('');
  });
});
