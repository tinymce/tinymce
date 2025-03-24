import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as TooltipUtils from '../../../module/TooltipUtils';

describe('browser.tinymce.themes.silver.editor.color.ImageSelectorTest', () => {
  const checkTooltip = async (editor: Editor, selector: string, tooltip: string) => {
    await TooltipUtils.pAssertTooltip(editor, async () => await TooltipUtils.pTriggerTooltipWithMouse(editor, selector), tooltip);
    await TooltipUtils.pCloseTooltip(editor, selector);
  };

  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'image-selector',
    setup: (editor: Editor) => {
      editor.ui.registry.addMenuButton('image-selector', {
        icon: 'image',
        tooltip: 'something',
        onSetup: (api) => {
          api.setIcon('blur');
          api.setTooltip('tooltip on setup');
          return Fun.noop;
        },
        fetch: (callback, _fetchContext, api) => {
          callback([
            {
              type: 'fancymenuitem',
              fancytype: 'imageselect',
              onAction: (data) => {
                editor.insertContent(`<p>${data.value}</p>`);
                api.setTooltip('new tooltip: ' + data.value);
              },
              select: (value) => value === 'fake2',
              initData: {
                columns: 3,
                items: [
                  {
                    url: 'fakeurl1', type: 'imageitem', text: 'Fake 1', label: 'Fake 1', value: 'fake1' },
                  {
                    url: 'fakeurl2', type: 'imageitem', text: 'Fake 2', label: 'Fake 2', tooltip: 'Fake 2', value: 'fake2' },
                  {
                    icon: 'color-swatch-remove-color', type: 'resetimage', tooltip: 'None', label: 'None', value: 'none'
                  }
                ]
              }
            }
          ]);
        }
      });
    }
  }, []);

  it('TINY-11847: clicking on an item should perform the `onAction` for that item', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Text</p>');

    await checkTooltip(editor, 'button[data-mce-name="image-selector"]', 'tooltip on setup');

    TinySelections.setSelection(editor, [], 0, [], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="image-selector"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-menu');

    TinyUiActions.clickOnUi(editor, 'div[aria-label="Fake 2"]');
    await checkTooltip(editor, 'button[data-mce-name="image-selector"]', 'new tooltip: fake2');
    TinyAssertions.assertContent(editor, '<p>fake2</p>');
  });

  it('TINY-11847: items without tooltip in their config should not have a tooltip', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Text</p>');
    TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="image-selector"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-menu');
    await TooltipUtils.pAssertNoTooltip(editor, async () => await TooltipUtils.pTriggerTooltipWithMouse(editor, 'div:has(img[src="fakeurl1"])'), '');
    TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="image-selector"]');
  });

  it('TINY-11847: selected items should have a check', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Text</p>');
    TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="image-selector"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-menu');
    await TinyUiActions.pWaitForUi(editor, 'div[aria-label="Fake 2"] .tox-collection__item-checkmark');
    TinyUiActions.clickOnToolbar(editor, 'button[data-mce-name="image-selector"]');
  });
});
