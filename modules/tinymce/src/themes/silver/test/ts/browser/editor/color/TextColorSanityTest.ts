import { ApproxStructure, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Assert, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, SugarShadowDom } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';
import * as ColorCache from 'tinymce/themes/silver/ui/core/color/ColorCache';
import { getColorCols } from 'tinymce/themes/silver/ui/core/color/Options';

describe('browser.tinymce.themes.silver.editor.color.TextColorSanityTest', () => {
  const selectors = {
    backcolorButton: 'div[title^="Background color"] .tox-tbtn',
    forecolorButton: 'div[title^="Text color"] .tox-tbtn',
    backcolorSplitButton: '[aria-label^="Background color"] > .tox-tbtn + .tox-split-button__chevron',
    forecolorSplitButton: '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron'
  };

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

  beforeEach(() => {
    LocalStorage.clear();
    ColorCache.clearStoredCaches();
  });

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
      TinyUiActions.clickOnUi(editor, selectors.forecolorButton);
      TinyAssertions.assertContentStructure(editor, forecolorStruct('rgb(0, 0, 0)'));
      setupContent(editor);
      TinyUiActions.clickOnUi(editor, selectors.backcolorButton);
      TinyAssertions.assertContentStructure(editor, backcolorStruct('rgb(0, 0, 0)'));
    });

    it('TBA: forecolor', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#2DC26B"]');
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#236FA1"]');
      TinyAssertions.assertContentStructure(editor, forecolorStruct('rgb(35, 111, 161)'));
    });

    it('TBA: backcolor', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#2DC26B"]');
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#236FA1"]');
      TinyAssertions.assertContentStructure(editor, backcolorStruct('rgb(35, 111, 161)'));
    });

    it('TINY-9184: Adding a color is added as expected', async () => {
      LocalStorage.clear();
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
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
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      UiFinder.exists(SugarBody.body(), 'div[data-mce-color="#FF0000"]');
      LocalStorage.clear();
    });
  });

  context('Custom Color Map Default Color Cols Sanity Test', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_cols: 3,
    }, [], true);

    it('TINY-9560: color_map_foreground has correct number of columns', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      Assert.eq('Cols is the expected value', 3, getColorCols(editor, 'forecolor'));
    });

    it('TINY-9560: color_map_background has correct number of columns', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      Assert.eq('Cols is the expected value', 3, getColorCols(editor, 'hilitecolor'));
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
      color_cols: 4
    }, [], true);

    it('TINY-9184: color_map_foreground works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#0000FF"]');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
      Assert.eq('Cols is the expected value', 4, getColorCols(editor, 'forecolor'));
    });

    it('TINY-9184: color_map_background works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#0000FF"]');
      Assert.eq('Cols is the expected value', 3, getColorCols(editor, 'hilitecolor'));
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
      color_cols: 4
    }, [], true);

    it('TINY-9184: color_map_foreground works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#0000FF"]');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#FF0000"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 2);
    });

    it('TINY-9184: color_map_background fallbacks as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#0000FF"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 4);
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
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#0000FF"]');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#FF0000"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 2);
    });

    it('TINY-9184: color_map_background works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      assertUiElementDoesNotExist(editor, 'div[data-mce-color="#FF0000"]');
      TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#0000FF"]');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 3);
    });
  });

  context('Decimal color_cols', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      color_cols_foreground: 8.6,
      color_cols_background: 4.3
    }, [], true);

    it('TINY-9737: Color_cols is rounded to nearest number', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      // Background Color swatch should have Math.sqrt(36) = 6 columns
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 9);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      // Background Color swatch should have Math.sqrt(49) = 7 columns
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 4);
    });
  });

  context('Custom Color Map With Fewer Than Default Custom Color Cols Test', () => {
    const colorMap = [
      '#2DC26B', 'Green',
      '#F1C40F', 'Yellow',
      '#E03E2D', 'Red',
      '#B96AD9', 'Purple',
      '#3598DB', 'Blue',
      '#E67E23', 'Orange'
    ];
    const thirtySixColors = Arr.flatten([ colorMap, colorMap, colorMap, colorMap, colorMap, colorMap ]);
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_cols: 3,
      color_map: thirtySixColors
    }, [], true);

    it('TINY-10098: color_map_foreground works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 3);
    });

    it('TINY-10098: color_map_background works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 3);
    });
  });

  context('Custom Color Map Default Columns Test', () => {
    const colorMap = [
      '#2DC26B', 'Green',
      '#F1C40F', 'Yellow',
      '#E03E2D', 'Red',
      '#B96AD9', 'Purple',
      '#3598DB', 'Blue',
      '#E67E23', 'Orange'
    ];
    const thirtySixColors = Arr.flatten([ colorMap, colorMap, colorMap, colorMap, colorMap, colorMap ]);
    const fourtyNineColors = Arr.flatten([ thirtySixColors, colorMap, colorMap, [ '#ffffff', 'White' ]]);
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_map_foreground: thirtySixColors,
      color_map_background: fourtyNineColors
    }, [], true);

    it('TINY-9184: color_map_foreground works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      // Background Color swatch should have Math.sqrt(36) = 6 columns
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 6);
    });

    it('TINY-9184: color_map_background works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      // Background Color swatch should have Math.sqrt(49) = 7 columns
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 7);
    });
  });

  context('Color Cols Set As Default With Custom Color Map Test', () => {
    const colorMap = [
      '#2DC26B', 'Green',
      '#F1C40F', 'Yellow',
      '#E03E2D', 'Red',
      '#B96AD9', 'Purple',
      '#3598DB', 'Blue',
      '#E67E23', 'Orange'
    ];
    const thirtySixColors = Arr.flatten([ colorMap, colorMap, colorMap, colorMap, colorMap, colorMap ]);
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_map: thirtySixColors,
      color_cols: 5
    }, [], true);

    it('TINY-10126: color_map_foreground works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 5);
    });

    it('TINY-10126: color_map_background works as expected', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 5);
    });
  });

  context('Custom Color Map Columns Test', () => {
    const colorMap = [
      '#2DC26B', 'Green',
      '#F1C40F', 'Yellow',
      '#E03E2D', 'Red',
      '#B96AD9', 'Purple',
      '#3598DB', 'Blue',
      '#E67E23', 'Orange'
    ];
    const thirtySixColors = Arr.flatten([ colorMap, colorMap, colorMap, colorMap, colorMap, colorMap ]);
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_cols: 8,
      color_map: thirtySixColors,
    }, [], true);

    it('TINY-10098: color_cols works as expected with custom color_map', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      // Background Color swatch should have Math.sqrt(36) = 6 columns
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 8);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      // Background Color swatch should have Math.sqrt(49) = 7 columns
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 8);
    });
  });

  context('Color Cols Default From Zero Test', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor fontsize',
      base_url: '/project/tinymce/js/tinymce',
      color_cols: 0,
      color_cols_foreground: 0
    }, [], true);

    it('TINY-9560: color_map_foreground has correct number of columns', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      // Foreground color gets value from `color_cols_foreground` which should be replaced when set to 0
      Assert.eq('Cols is the expected value', getColorCols(editor, 'forecolor'), 5);
    });

    it('TINY-9560: color_map_background has correct number of columns', async () => {
      const editor = hook.editor();
      setupContent(editor);
      TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      // Background color should get default value from `color_cols` which should be replaced when set to 0
      Assert.eq('Cols is the expected value', getColorCols(editor, 'hilitecolor'), 5);
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
      TinyUiActions.clickOnUi(editor, selectors.forecolorButton);
      TinyAssertions.assertContentStructure(editor, forecolorStruct('yellow'));
      setupContent(editor);
      TinyUiActions.clickOnUi(editor, selectors.backcolorButton);
      TinyAssertions.assertContentStructure(editor, backcolorStruct('cyan'));
    });
  });
});
