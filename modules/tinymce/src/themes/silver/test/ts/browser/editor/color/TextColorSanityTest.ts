import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.color.TextColorSanityTest', () => {

  const forecolorStruct = (color: string) => ApproxStructure.build((s, str) => {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                color: str.is(color)
              },
              children: [
                s.text(str.is('hello'))
              ]
            }),
            s.text(str.is(' test'))
          ]
        })
      ]
    });
  });

  const backcolorStruct = (color: string) => ApproxStructure.build((s, str) => {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              styles: {
                'background-color': str.is(color)
              },
              children: [
                s.text(str.is('hello'))
              ]
            }),
            s.text(str.is(' test'))
          ]
        })
      ]
    });
  });

  const setupContent = (editor: Editor) => {
    editor.setContent('hello test');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 5);
  };

  context('No default background or foreground set', () => {

    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce'
    }, [], true);

    it('TINY-7836: Initial color is set to black for text color and to white for background color', () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnUi(editor, 'div[title="Text color"] .tox-tbtn');
      TinyAssertions.assertContentStructure(editor, forecolorStruct('black'));
      setupContent(editor);
      TinyUiActions.clickOnUi(editor, 'div[title="Background color"] .tox-tbtn');
      TinyAssertions.assertContentStructure(editor, backcolorStruct('white'));
    });

    it('TBA: forecolor', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#2DC26B"]');
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#236FA1"]');
      TinyAssertions.assertContentStructure(editor, forecolorStruct('rgb(35, 111, 161)'));
    });

    it('TBA: backcolor', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#2DC26B"]');
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#236FA1"]');
      TinyAssertions.assertContentStructure(editor, backcolorStruct('rgb(35, 111, 161)'));
    });
  });

  context('Custom default background and foreground set', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_foreground_default: 'yellow',
      color_background_default: 'cyan'
    }, [], true);

    it('TINY-9183: Initial color is set to yellow for text color and to cyan for background color', () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnUi(editor, 'div[title="Text color"] .tox-tbtn');
      TinyAssertions.assertContentStructure(editor, forecolorStruct('yellow'));
      setupContent(editor);
      TinyUiActions.clickOnUi(editor, 'div[title="Background color"] .tox-tbtn');
      TinyAssertions.assertContentStructure(editor, backcolorStruct('cyan'));
    });
  });

});
