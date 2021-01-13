import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { Class, Css } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/visualblocks/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.visualblocks.PreviewFormatsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'visualblocks',
    toolbar: 'visualblocks',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const pWaitForVisualBlocks = (editor: Editor, waitUntilEnabled: boolean = true) =>
    Waiter.pTryUntil('Wait for background css to be applied to first element', () => {
      const p = TinyDom.fromDom(editor.getBody().firstChild);
      const background = Css.get(p, 'background-image');
      if (waitUntilEnabled) {
        assert.include(background, 'url(', 'Paragraph should have a url background');
        assert.isTrue(Class.has(TinyDom.body(editor), 'mce-visualblocks'), 'Visual blocks class should exist');
      } else {
        assert.notInclude(background, 'url(', 'Paragraph should not have a url background');
        assert.isFalse(Class.has(TinyDom.body(editor), 'mce-visualblocks'), 'Visual blocks class should not exist');
      }
    });

  it('TBA: Toggle on/off visualblocks and compute previews', async () => {
    const editor = hook.editor();
    editor.execCommand('mceVisualBlocks');
    await pWaitForVisualBlocks(editor);
    assert.include(editor.formatter.getCssText('h1'), 'border:0px none', 'Should not have a border');

    editor.execCommand('mceVisualBlocks');
    await pWaitForVisualBlocks(editor, false);
    assert.include(editor.formatter.getCssText('h1'), 'border:0px none', 'Should not have a border');
  });
});
