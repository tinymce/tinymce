import { ApproxStructure, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Assert, context, describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarShadowDom } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';
import { getColorCols } from 'tinymce/themes/silver/ui/core/color/Options';

describe('browser.tinymce.themes.silver.editor.color.TextColorSanityTest', () => {
  const assertUiElementDoesNotExist = (editor: Editor, selector: string) =>
    UiFinder.notExists(SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement((editor)))), selector);

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

  context('Basic Color Sanity Test', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce'
    }, [], true);

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

    it('TINY-9184: Adding a color is added as expected', async () => {
      LocalStorage.clear();
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      UiFinder.notExists(SugarBody.body(), 'div[data-mce-color="#FF0000"]');
      TinyUiActions.clickOnUi(editor, 'button[title="Custom color"]');
      const dialog = await TinyUiActions.pWaitForDialog(editor);
      const input = UiFinder.findIn<HTMLInputElement>(dialog, 'label:contains("R") + input').getOrDie();
      UiControls.setValue(input, '255');
      const evt = new Event('input', {
        bubbles: true,
        cancelable: true
      });
      input.dom.dispatchEvent(evt);
      const dialogResult = UiFinder.findIn<HTMLInputElement>(dialog, 'label:contains("#") + input').getOrDie();
      await Waiter.pTryUntil('Dialog has changed', () => dialogResult.dom.value === 'FF0000');
      TinyUiActions.clickOnUi(editor, 'button[title="Save"]');
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      UiFinder.exists(SugarBody.body(), 'div[data-mce-color="#FF0000"]');
      LocalStorage.clear();
    });
  });

  context('Custom Color Map Background Color Sanity Test', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_map_background: [
        '#0000FF', 'BLUE',
      ],
      color_cols_background: 3,
    }, [], true);

    it('TINY-9184: color_map_foreground works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#0000FF"]');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 5);
    });

    it('TINY-9184: color_map_background works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#0000FF"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 3);
    });
  });

  context('Custom Color Map Foreground Color Sanity Test', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_map_foreground: [
        '#FF0000', 'RED',
      ],
      color_cols_foreground: 2,
    }, [], true);

    it('TINY-9184: color_map_foreground works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#0000FF"]');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#FF0000"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 2);
    });

    it('TINY-9184: color_map_background fallbacks as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#0000FF"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 5);
    });
  });

  context('Custom Color Sanity Test', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_map_foreground: [
        '#FF0000', 'RED',
      ],
      color_map_background: [
        '#0000FF', 'BLUE',
      ],
      color_cols_foreground: 2,
      color_cols_background: 3,
    }, [], true);

    it('TINY-9184: color_map_foreground works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#0000FF"]');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#FF0000"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 2);
    });

    it('TINY-9184: color_map_background works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#0000FF"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 3);
    });
  });

  context('Custom default background and foreground set', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_default_foreground: 'yellow',
      color_default_background: 'cyan'
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
