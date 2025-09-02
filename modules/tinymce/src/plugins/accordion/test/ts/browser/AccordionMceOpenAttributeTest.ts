import { describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

describe('browser.tinymce.plugins.accordion.AccordionMceOpenAttributeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      toolbar: 'accordiontoggle',
      base_url: '/project/tinymce/js/tinymce',
    },
    [ Plugin ]
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
      '<details open="open"><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );
  });

  it('TINY-12315: `data-mce-open` attribute should be added when setting the content in readonly editor', () => {
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
    const setupElement = () => {
      const container = SugarElement.fromTag('div');
      const editorElm = SugarElement.fromTag('textarea');
      editorElm.dom.innerHTML =
        '<details><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
        '<details open><summary>Toggle accordion</summary><p>Expanded info</p></details>';
      Insert.append(container, editorElm);
      Insert.append(SugarBody.body(), container);

      return {
        element: editorElm,
        teardown: () => Remove.remove(container)
      };
    };

    const readonlyHook = TinyHooks.bddSetupFromElement<Editor>(
      {
        plugins: 'accordion',
        toolbar: 'accordiontoggle',
        base_url: '/project/tinymce/js/tinymce',
        readonly: true
      },
      setupElement,
      [ Plugin ]
    );

    it('TINY-12315: `data-mce-open` attribute should be added when editor is in readonly by default', () => {
      const editor = readonlyHook.editor();
      TinyAssertions.assertRawContent(editor,
        '<details data-mce-open="false"><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
        '<details open="" data-mce-open="true"><summary>Toggle accordion</summary><p>Expanded info</p></details>'
      );
    });
  });

  it(`TINY-12315: Update the value of 'open' attribute, to reflect the value in 'data-mce-open' attribute when entering design mode`, () => { 
    const editor = hook.editor();
    editor.setContent(
      '<details><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
      '<details open><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );
    editor.mode.set('readonly');

    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('ToggleAccordion');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    editor.execCommand('ToggleAccordion');
    TinyAssertions.assertRawContent(editor,
      '<details data-mce-open="false" open="open"><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
      '<details data-mce-open="true" data-mce-selected="1"><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );
    editor.mode.set('design');

    TinyAssertions.assertRawContent(editor,
      '<details><summary>Toggle accordion</summary><p>Hidden info</p></details>' +
      '<details data-mce-selected="1" open="open"><summary>Toggle accordion</summary><p>Expanded info</p></details>'
    );
  });
});
