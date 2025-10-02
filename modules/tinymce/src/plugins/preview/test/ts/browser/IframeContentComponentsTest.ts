import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import type Editor from 'tinymce/core/api/Editor';
import * as IframeContent from 'tinymce/plugins/preview/core/IframeContent';
import Plugin from 'tinymce/plugins/preview/Plugin';

describe('browser.tinymce.plugins.preview.core.IframeContentTest', () => {
  const fakeComponent = `console.log("test-component loaded");`;

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'preview',
    base_url: '/project/tinymce/js/tinymce',
    content_css: '/project/tinymce/js/tinymce/skins/content/default/content.css',
    setup: (editor: Editor) => {
      editor.on('PreInit', () => {
        editor.schema.addCustomElements({
          'test-component': {
            extends: 'span',
            componentUrl: 'data:,' + encodeURIComponent(fakeComponent),
          }
        });
      });
    }
  }, [ Plugin ]);

  it('TINY-13006: Should include the component script', () => {
    const editor = hook.editor();

    assert.include(
      IframeContent.getPreviewHtml(editor),
      '<script src="data:,console.log(%22test-component%20loaded%22)%3B"></script>',
      'Should include the component script'
    );

  });

  it('TINY-13006: Should include the component script with crossorigin attribute', () => {
    const editor = hook.editor();

    ScriptLoader.ScriptLoader._setCrossOrigin(Fun.constant('anonymous'));

    assert.include(
      IframeContent.getPreviewHtml(editor),
      '<script src="data:,console.log(%22test-component%20loaded%22)%3B" crossorigin="anonymous"></script>',
      'Should include the component script with crossorigin attribute'
    );

    ScriptLoader.ScriptLoader._setCrossOrigin(Fun.constant(undefined));
  });

  it('TINY-13006: Should include the component script with referrer attribute', () => {
    const editor = hook.editor();

    ScriptLoader.ScriptLoader._setReferrerPolicy('no-referrer');

    assert.include(
      IframeContent.getPreviewHtml(editor),
      '<script src="data:,console.log(%22test-component%20loaded%22)%3B" referrerpolicy="no-referrer"></script>',
      'Should include the component script with referrerpolicy attribute'
    );

    ScriptLoader.ScriptLoader._setReferrerPolicy('');
  });

});

