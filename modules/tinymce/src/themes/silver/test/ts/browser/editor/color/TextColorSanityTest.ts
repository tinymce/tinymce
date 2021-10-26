import { ApproxStructure } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.color.TextColorSanityTest', () => {
  before(function () {
    const browser = PlatformDetection.detect().browser;
    if (browser.isIE()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor fontsizeselect',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

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

  it('TINY-7836: Initial color is set to black for both buttons', () => {
    const editor = hook.editor();
    setupContent(editor);
    TinyUiActions.clickOnUi(editor, 'div[title="Text color"] .tox-tbtn');
    TinyAssertions.assertContentStructure(editor, forecolorStruct('rgb(0, 0, 0)'));
    setupContent(editor);
    TinyUiActions.clickOnUi(editor, 'div[title="Background color"] .tox-tbtn');
    TinyAssertions.assertContentStructure(editor, backcolorStruct('rgb(0, 0, 0)'));
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
