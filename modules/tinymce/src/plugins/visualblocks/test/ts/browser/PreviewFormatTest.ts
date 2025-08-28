import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Class, Css, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/visualblocks/Plugin';

describe('browser.tinymce.plugins.visualblocks.PreviewFormatsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'visualblocks',
    toolbar: 'visualblocks',
    base_url: '/project/tinymce/js/tinymce',
    content_style: `
      h1 {
        border: 2px solid black;
      }
      .mce-visualblocks h1 {
        border: 13px solid black;
      }
    `
  }, [ Plugin ]);

  const pWaitForVisualBlocks = (editor: Editor, waitUntilEnabled: boolean = true) =>
    Waiter.pTryUntil('Wait for background css to be applied to first element', () => {
      const p = SugarElement.fromDom(editor.getBody().firstElementChild as HTMLElement);
      const background = Css.get(p, 'background-image');
      if (waitUntilEnabled) {
        assert.include(background, 'url(', 'Paragraph should have a url background');
        assert.isTrue(Class.has(TinyDom.body(editor), 'mce-visualblocks'), 'Visual blocks class should exist');
      } else {
        assert.notInclude(background, 'url(', 'Paragraph should not have a url background');
        assert.isFalse(Class.has(TinyDom.body(editor), 'mce-visualblocks'), 'Visual blocks class should not exist');
      }
    });

  const assertBorderWidth = (element: HTMLElement, expectedWidth: string) => {
    // we need to use `border-left-width` rather than the short hand `border-width` for the computed value to be valid in Firefox
    assert.equal(Css.get(SugarElement.fromDom(element), 'border-left-width'), expectedWidth);
  };

  it('TBA: Toggle on/off visualblocks and compute previews', async () => {
    const editor = hook.editor();
    editor.setContent('<h1>something</h1>');
    const h1 = editor.dom.select('h1')[0];
    assertBorderWidth(h1, '2px');  // content style is overridden so that all h1s have a 1px border

    editor.execCommand('mceVisualBlocks');
    await pWaitForVisualBlocks(editor);
    assertBorderWidth(h1, '13px');

    editor.execCommand('mceVisualBlocks');
    await pWaitForVisualBlocks(editor, false);
    assertBorderWidth(h1, '2px');
  });
});
