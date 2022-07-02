import { ApproxStructure, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.color.TextColorSanityTest', () => {
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

  const backcolorRemoveAllColorsStruct = (color1: string, color2: string) => ApproxStructure.build((s, str) => {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            // Prefer startsWith because the trailing space may get converted to an &nbsp;
            s.text(str.startsWith('say')),
            s.element('span', {
              styles: {
                'background-color': str.is(color1)
              },
              children: [
                s.text(str.contains('hello')),
                s.element('span', {
                  styles: {
                    'background-color': str.is(color2)
                  },
                  children: [
                    s.text(str.contains('twice'))
                  ]
                }),
                s.element('span', {}) // extra bogus elem
              ]
            }),
            s.element('span', {
              children: [
                s.element('span', {
                  styles: {
                    'background-color': str.none()
                  },
                  children: [
                    s.text(str.contains('test'))
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
  });

  const setupContent = (editor: Editor) => {
    editor.setContent('hello test');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 5);
  };

  const typeString = async (editor: Editor, val: string) => {
    editor.focus();
    for (let i = 0; i < val.length; i += 1) {
      editor.insertContent(val[i]);
      TinyContentActions.keypress(editor, val.charCodeAt(i));
      await Waiter.pWait(50);
    }
  };

  it('TINY-7836: Initial color is set to black for text color button', () => {
    const editor = hook.editor();
    setupContent(editor);
    TinyUiActions.clickOnUi(editor, 'div[title="Text color"] .tox-tbtn');
    TinyAssertions.assertContentStructure(editor, forecolorStruct('rgb(0, 0, 0)'));
  });

  it('TBA: Initial color is set to "light yellow" for background color button', () => {
    const editor = hook.editor();
    setupContent(editor);
    TinyUiActions.clickOnUi(editor, 'div[title="Background color"] .tox-tbtn');
    TinyAssertions.assertContentStructure(editor, backcolorStruct('rgb(251, 238, 184)'));
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

  it('TBA: Clicking background color button twice will turn it on, then turn it off', async () => {
    const editor = hook.editor();
    editor.setContent('');

    // Type first word with no styling
    await typeString(editor, 'say ');

    // Pick light yellow for next word
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#FBEEB8"]');
    await typeString(editor, 'hello');

    // Pick another color right away (no remove)
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[data-mce-color="#236FA1"]');
    await typeString(editor, ' twice');

    // Now click remove and expect all previous color
    // selections to be removed (back to plain, no background)
    TinyUiActions.clickOnToolbar(editor, '[aria-label="Background color"] > .tox-tbtn + .tox-split-button__chevron');
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'div[title="Remove color"]');
    await typeString(editor, ' test');
    TinyAssertions.assertContentStructure(editor, backcolorRemoveAllColorsStruct('rgb(251, 238, 184)', 'rgb(35, 111, 161)'));
  });
});
