import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Class, Css, SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUi } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.SplitButtonClassAndWidthTest', () => {

  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'split-icon-only split-with-text',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      // Icon-only split button
      editor.ui.registry.addSplitButton('split-icon-only', {
        icon: 'bold',
        tooltip: 'Bold',
        onAction: () => editor.execCommand('Bold'),
        onItemAction: (_api, value) => editor.execCommand(value),
        fetch: (callback) => {
          callback([
            {
              type: 'choiceitem' as const,
              icon: 'italic',
              text: 'Italic',
              value: 'Italic'
            }
          ]);
        }
      });

      // Split button with text
      editor.ui.registry.addSplitButton('split-with-text', {
        text: 'My Button',
        icon: 'info',
        tooltip: 'Execute my action',
        onAction: () => editor.insertContent('<p>Clicked main</p>'),
        onItemAction: (_api, value) => editor.insertContent(value),
        fetch: (callback) => {
          callback([
            {
              type: 'choiceitem' as const,
              text: 'Option 1',
              value: '<p>Option 1</p>'
            }
          ]);
        }
      });
    }
  }, []);

  it('TINY-13111: Icon-only split button should NOT have tox-tbtn--select class', async () => {
    const editor = hook.editor();
    const button = await TinyUi(editor).pWaitForUi('button.tox-split-button__main[data-mce-name="split-icon-only"]');

    assert.isTrue(Class.has(button, 'tox-tbtn'), 'Should have tox-tbtn class');
    assert.isTrue(Class.has(button, 'tox-split-button__main'), 'Should have tox-split-button__main class');
    assert.isFalse(Class.has(button, 'tox-tbtn--select'), 'Should NOT have tox-tbtn--select class');
  });

  it('TINY-13111: Split button with text should have tox-tbtn--select class', async () => {
    const editor = hook.editor();
    const button = await TinyUi(editor).pWaitForUi('button.tox-split-button__main[data-mce-name="split-with-text"]');

    assert.isTrue(Class.has(button, 'tox-tbtn'), 'Should have tox-tbtn class');
    assert.isTrue(Class.has(button, 'tox-split-button__main'), 'Should have tox-split-button__main class');
    assert.isTrue(Class.has(button, 'tox-tbtn--select'), 'Should have tox-tbtn--select class');
  });

  it('TINY-13111: Icon-only split button width should be ~34px (standard button width)', async () => {
    const editor = hook.editor();
    const button = await TinyUi(editor).pWaitForUi('button.tox-split-button__main[data-mce-name="split-icon-only"]');

    const width = parseFloat(Css.get(button, 'width'));
    // Allow some tolerance for sub-pixel rendering (33-35px range)
    assert.isTrue(width >= 33 && width <= 35, `Expected width ~34px, but got ${width}px`);
  });

  it('TINY-13111: Split button with text width should be greater than icon-only button', async () => {
    const editor = hook.editor();
    const iconButton = await TinyUi(editor).pWaitForUi('button.tox-split-button__main[data-mce-name="split-icon-only"]');
    const textButton = await TinyUi(editor).pWaitForUi('button.tox-split-button__main[data-mce-name="split-with-text"]');

    const iconWidth = parseFloat(Css.get(iconButton, 'width'));
    const textWidth = parseFloat(Css.get(textButton, 'width'));

    assert.isTrue(textWidth > iconWidth,
      `Text button (${textWidth}px) should be wider than icon-only button (${iconWidth}px)`);
    assert.isTrue(textWidth > 50,
      `Text button should be significantly wider than 34px, but got ${textWidth}px`);
  });

  it('TINY-13111: Icon-only split button inline width style should be ~34px after forceInitialSize', async () => {
    const editor = hook.editor();
    const button = await TinyUi(editor).pWaitForUi('button.tox-split-button__main[data-mce-name="split-icon-only"]');

    // After forceInitialSize runs, there should be an inline style with ~34px
    const inlineStyle = button.dom.getAttribute('style');
    assert.isTrue(inlineStyle !== null && inlineStyle.includes('width'),
      'Button should have inline width style after forceInitialSize');

    const width = parseFloat(Css.get(button, 'width'));
    assert.isTrue(width >= 33 && width <= 35,
      `Inline width should be ~34px, but got ${width}px`);
  });

  it('TINY-13111: Split button with text should have tox-tbtn__select-label element', async () => {
    UiFinder.exists(SugarBody.body(),
      'button.tox-split-button__main[data-mce-name="split-with-text"] .tox-tbtn__select-label');
  });

  it('TINY-13111: Icon-only split button should NOT have tox-tbtn__select-label element', async () => {
    UiFinder.notExists(SugarBody.body(),
      'button.tox-split-button__main[data-mce-name="split-icon-only"] .tox-tbtn__select-label');
  });
});
