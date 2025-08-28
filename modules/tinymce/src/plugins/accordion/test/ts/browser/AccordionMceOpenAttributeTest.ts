import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

describe('browser.tinymce.plugins.accordion.AccordionMceOpenAttributeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      toolbar: 'accordiontoggle',
      base_url: '/project/tinymce/js/tinymce',
    },
    [Plugin]
  );

  it('TINY-12315: `data-mce-open` attributes should be added/removed when entering/leaving readonly mode', () => {
    const editor = hook.editor();
    editor.setContent(
      '<details><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
      '<details open><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );

    TinyAssertions.assertRawContent(editor,
      '<details><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
      '<details open=""><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );
    editor.mode.set('readonly');

    TinyAssertions.assertRawContent(editor,
      '<details data-mce-open="false"><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
      '<details open="" data-mce-open="true"><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );
    editor.mode.set('design');

    TinyAssertions.assertRawContent(editor,
      '<details><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
      '<details open=""><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );
  });

  it.skip('TINY-12315: `data-mce-open` attribute should be added when setting the content in readonly editor', () => {
    const editor = hook.editor();
    editor.mode.set('readonly');
    editor.setContent(
      '<details><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
      '<details open><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );

    TinyAssertions.assertRawContent(editor,
      '<details data-mce-open="false"><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
      '<details open="" data-mce-open="true"><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );
  });

  describe('readonly by default', () => {
    // TODO: readonly: true is not working, and initialContent is not working as well
    const readonlyHook = TinyHooks.bddSetup<Editor>(
      {
        plugins: 'accordion',
        toolbar: 'accordiontoggle',
        base_url: '/project/tinymce/js/tinymce',
        readonly: true,
        initialContent: '<h1>Hello</h1>'
      },
      [ Plugin ]
    );

    it.only('TINY-12315: `data-mce-open` attribute should be added when editor is in readonly by default', () => {
      const editor = readonlyHook.editor();
      TinyAssertions.assertRawContent(editor,
        '<details data-mce-open="false"><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
        '<details open="" data-mce-open="true"><summary>Toggle accordion</summary><p>Expanded info</p></details>'
      );
    });
  });

  /* TODO: data-mce-open should be added when editor is in readonly by default */
  /* TODO: data-mce-open should be added when content is set in readonly mode (see if possible) */
  /* TODO: data-mce-open should be removed when entering design mode */
  /* TODO: open should change it's value to `data-mce-open` when entering design mode */
  /* TODO: getContent in readonly mode should replace open with data-mce-open and remove data-mce-open */
  /* TODO: getContent in design mode should replace data-mce-open */
});
