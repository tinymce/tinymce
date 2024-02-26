import { Keys, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as Assets from '../../../module/Assets';
import * as AutocompleterUtils from '../../../module/AutocompleterUtils';
import * as TooltipUtils from '../../../module/TooltipUtils';

describe('browser.tinymce.themes.silver.editor.AutocompleterTooltipTest', () => {
  const pOpenAutocompleter = async (editor: Editor, triggerChar: string) => {
    editor.focus();
    editor.setContent(`<p>${triggerChar}</p>`);
    TinySelections.setCursor(editor, [ 0, 0 ], triggerChar.length);
    editor.dispatch('input');
    await UiFinder.pWaitForVisible('Wait for autocompleter to appear', SugarBody.body(), '.tox-autocompleter');
  };

  const pCloseAutocompleterByKey = async (editor: Editor) => {
    TinyContentActions.keydown(editor, Keys.escape());
    await AutocompleterUtils.pWaitForAutocompleteToClose();
    await Waiter.pTryUntil(
      'Waiting for tooltip to NO LONGER be in DOM',
      () => UiFinder.notExists(SugarBody.body(), '.tox-silver-sink .tox-tooltip__body'));
  };

  context('AutocompleteItem, columns = auto', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addAutocompleter('test', {
          trigger: '+',
          minChars: 0,
          columns: 'auto',
          fetch: () => {
            return Promise.resolve(Arr.map([ 'aa', 'ab' ], (letter) => ({
              value: `${letter}`,
              text: `p-${letter}`,
              icon: letter
            })));
          },
          onAction: Fun.noop
        });
      }
    });

    it('TINY-9638: Should show tooltip when autocompleter is shown', async () => {
      const editor = hook.editor();
      await TooltipUtils.pAssertTooltip(editor, async () => await pOpenAutocompleter(editor, '+'), 'p-aa');
      await pCloseAutocompleterByKey(editor);
    });

    it('TINY-9638: Should show tooltip when autocompleter is shown and navigate with keyboard', async () => {
      const editor = hook.editor();
      editor.focus();
      await TooltipUtils.pAssertTooltip(editor, async () => await pOpenAutocompleter(editor, '+'), 'p-aa');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyContentActions.keydown(editor, Keys.right());
        await TinyUiActions.pWaitForUi(editor, '.tox-silver-sink .tox-tooltip__body:contains("p-ab")');
        return Promise.resolve();
      }, 'p-ab');
      await pCloseAutocompleterByKey(editor);
    });

    it('TINY-9638: Should show tooltip when autocompleter is shown and navigate with mouse', async () => {
      const editor = hook.editor();
      editor.focus();
      await TooltipUtils.pAssertTooltip(editor, async () => await pOpenAutocompleter(editor, '+'), 'p-aa');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TooltipUtils.pTriggerTooltipWithMouse(editor, '.tox-collection__item .tox-collection__item-icon:contains("ab")');
        await TinyUiActions.pWaitForUi(editor, '.tox-silver-sink .tox-tooltip__body:contains("p-ab")');
        return Promise.resolve();
      }, 'p-ab');
      await pCloseAutocompleterByKey(editor);
    });
  });

  context('AutocompleteItem, columns = 1', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addAutocompleter('test', {
          trigger: '+',
          minChars: 0,
          columns: 1,
          fetch: () => {
            return Promise.resolve(Arr.map([ 'aa', 'ab' ], (letter) => ({
              value: `${letter}`,
              text: `p-${letter}`,
              icon: letter
            })));
          },
          onAction: Fun.noop
        });
      }
    });

    it('TINY-9638: Tooltip should not be shown when columns = 1, as text will be shown', async () => {
      const editor = hook.editor();
      await TooltipUtils.pAssertNoTooltip(editor, async () => await pOpenAutocompleter(editor, '+'), '');
      await pCloseAutocompleterByKey(editor);
    });
  });

  context('CardMenuItem', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addAutocompleter('test', {
          trigger: '+',
          minChars: 0,
          columns: 1,
          fetch: () => {
            return Promise.resolve(Arr.map([ 'aa', 'ab' ], (letter) => ({
              value: `euro-${letter}`,
              ariaLabel: letter,
              type: 'cardmenuitem',
              label: letter,
              items: [
                {
                  type: 'cardimage',
                  src: Assets.getGreenImageDataUrl(),
                  classes: [ 'my_autocompleter_avatar_class' ]
                },
                {
                  type: 'cardcontainer',
                  direction: 'vertical',
                  align: 'right',
                  valign: 'bottom',
                  items: [
                    {
                      type: 'cardtext',
                      text: letter,
                      classes: [ 'my_text_class' ],
                      name: 'my_text_to_highlight'
                    }
                  ]
                }
              ]

            })));
          },
          onAction: Fun.noop
        });
      }
    });

    it('TINY-9638: Tooltip should not be shown when using CardMenuItem in autocompleter', async () => {
      const editor = hook.editor();
      await TooltipUtils.pAssertNoTooltip(editor, async () => await pOpenAutocompleter(editor, '+'), '');
      await pCloseAutocompleterByKey(editor);
    });
  });
});
