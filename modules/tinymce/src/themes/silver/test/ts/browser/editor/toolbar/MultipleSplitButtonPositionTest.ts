import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.MultipleSplitButtonPositionTest', () => {
  context('Multiple split buttons positioning', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'split1 split2 split3',
      setup: (editor: Editor) => {
        editor.ui.registry.addSplitButton('split1', {
          text: 'Split 1',
          onAction: Fun.noop,
          onItemAction: (api, _value) => {
            api.setActive(true);
          },
          fetch: (callback) => {
            callback([
              {
                type: 'choiceitem',
                text: 'Option 1A',
                value: 'option1a'
              }
            ]);
          }
        });

        editor.ui.registry.addSplitButton('split2', {
          text: 'Split 2',
          onAction: Fun.noop,
          onItemAction: (api, _value) => {
            api.setActive(true);
          },
          fetch: (callback) => {
            callback([
              {
                type: 'choiceitem',
                text: 'Option 2A',
                value: 'option2a'
              }
            ]);
          }
        });

        editor.ui.registry.addSplitButton('split3', {
          text: 'Split 3',
          onAction: Fun.noop,
          onItemAction: (api, _value) => {
            api.setActive(true);
          },
          fetch: (callback) => {
            callback([
              {
                type: 'choiceitem',
                text: 'Option 3A',
                value: 'option3a'
              }
            ]);
          }
        });
      }
    }, []);

    it('TINY-8665: Multiple split buttons should render correctly', async () => {
      const editor = hook.editor();
      await TinyUiActions.pWaitForUi(editor, '.tox-editor-header');

      const chevrons = UiFinder.findAllIn(SugarBody.body(), '.tox-split-button__chevron');
      assert.equal(chevrons.length, 3, 'Should have 3 split button chevrons');

      const mainButtons = UiFinder.findAllIn(SugarBody.body(), '.tox-split-button__main');
      assert.equal(mainButtons.length, 3, 'Should have 3 main split buttons');
    });

    it('TINY-8665: Split button dropdowns should open correctly', async () => {
      const editor = hook.editor();
      await TinyUiActions.pWaitForUi(editor, '.tox-editor-header');

      const chevrons = UiFinder.findAllIn(SugarBody.body(), '.tox-split-button__chevron');
      assert.isTrue(chevrons.length >= 3, 'Should have at least 3 chevrons');

      // Click the first split button's chevron using data-mce-name
      TinyUiActions.clickOnUi(editor, '[data-mce-name="split1-chevron"]');
      await TinyUiActions.pWaitForUi(editor, '.tox-collection');

      const menuItems = UiFinder.findAllIn(SugarBody.body(), '.tox-collection .tox-collection__item');
      assert.isTrue(menuItems.length > 0, 'Should have menu items in dropdown');

      TinyUiActions.keystroke(editor, 27);

      // Click the second split button's chevron using data-mce-name
      TinyUiActions.clickOnUi(editor, '[data-mce-name="split2-chevron"]');
      await TinyUiActions.pWaitForUi(editor, '.tox-collection');

      const menuItems2 = UiFinder.findAllIn(SugarBody.body(), '.tox-collection .tox-collection__item');
      assert.isTrue(menuItems2.length > 0, 'Second dropdown should have menu items');

      TinyUiActions.keystroke(editor, 27);
    });

    it('TINY-8665: Dropdowns should be positioned close to their corresponding buttons', async () => {
      const editor = hook.editor();
      await TinyUiActions.pWaitForUi(editor, '.tox-editor-header');

      const chevrons = UiFinder.findAllIn(SugarBody.body(), '.tox-split-button__chevron');
      assert.isTrue(chevrons.length >= 2, 'Should have at least 2 chevrons for positioning test');

      const firstChevron = UiFinder.findIn(SugarBody.body(), '[data-mce-name="split1-chevron"]').getOrDie();
      TinyUiActions.clickOnUi(editor, '[data-mce-name="split1-chevron"]');
      const firstPopup = await TinyUiActions.pWaitForUi(editor, '.tox-collection');

      const firstChevronRect = firstChevron.dom.getBoundingClientRect();
      const firstPopupRect = firstPopup.dom.getBoundingClientRect();

      TinyUiActions.keystroke(editor, 27);

      const secondChevron = UiFinder.findIn(SugarBody.body(), '[data-mce-name="split2-chevron"]').getOrDie();
      TinyUiActions.clickOnUi(editor, '[data-mce-name="split2-chevron"]');
      const secondPopup = await TinyUiActions.pWaitForUi(editor, '.tox-collection');

      const secondChevronRect = secondChevron.dom.getBoundingClientRect();
      const secondPopupRect = secondPopup.dom.getBoundingClientRect();

      const popupPositionDifference = Math.abs(firstPopupRect.left - secondPopupRect.left);
      assert.isAtLeast(popupPositionDifference, 20,
        'Popups should be positioned at different locations, validating getHotspot fix');

      const firstHorizontalDistance = Math.abs(firstChevronRect.left - firstPopupRect.left);
      const secondHorizontalDistance = Math.abs(secondChevronRect.left - secondPopupRect.left);

      assert.isAtMost(firstHorizontalDistance, 100,
        'First popup should be horizontally close to first chevron');
      assert.isAtMost(secondHorizontalDistance, 100,
        'Second popup should be horizontally close to second chevron');

      TinyUiActions.keystroke(editor, 27);
    });

    it('TINY-8665: Active states should be updated correctly for each split button', async () => {
      const editor = hook.editor();
      await TinyUiActions.pWaitForUi(editor, '.tox-editor-header');

      const button1 = UiFinder.findIn(SugarBody.body(), '[data-mce-name="split1"]').getOrDie();
      const button2 = UiFinder.findIn(SugarBody.body(), '[data-mce-name="split2"]').getOrDie();
      const chevron1 = UiFinder.findIn(SugarBody.body(), '[data-mce-name="split1-chevron"]').getOrDie();
      const chevron2 = UiFinder.findIn(SugarBody.body(), '[data-mce-name="split2-chevron"]').getOrDie();

      assert.isFalse(button1.dom.classList.contains('tox-tbtn--enabled'), 'First button should initially be inactive');
      assert.isFalse(button2.dom.classList.contains('tox-tbtn--enabled'), 'Second button should initially be inactive');

      TinyUiActions.clickOnUi(editor, '[data-mce-name="split1-chevron"]');
      await TinyUiActions.pWaitForUi(editor, '.tox-collection');

      assert.equal(chevron1.dom.getAttribute('aria-expanded'), 'true', 'First chevron should show dropdown expanded');

      TinyUiActions.clickOnUi(editor, '.tox-collection .tox-collection__item');

      assert.isTrue(button1.dom.classList.contains('tox-tbtn--enabled'), 'First button should be active after item selection');
      assert.isFalse(button2.dom.classList.contains('tox-tbtn--enabled'), 'Second button should remain inactive');

      TinyUiActions.clickOnUi(editor, '[data-mce-name="split2-chevron"]');
      await TinyUiActions.pWaitForUi(editor, '.tox-collection');

      assert.equal(chevron2.dom.getAttribute('aria-expanded'), 'true', 'Second chevron should show dropdown expanded');

      TinyUiActions.clickOnUi(editor, '.tox-collection .tox-collection__item');

      assert.isTrue(button1.dom.classList.contains('tox-tbtn--enabled'), 'First button should remain active');
      assert.isTrue(button2.dom.classList.contains('tox-tbtn--enabled'), 'Second button should now be active after item selection');
    });
  });
});
