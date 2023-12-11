import { Keys, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, SelectorFilter, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as Assets from '../../../module/Assets';
import * as AutocompleterUtils from '../../../module/AutocompleterUtils';

interface TestScenario {
  readonly triggerChar: string;
  readonly label: string;
}

describe('browser.tinymce.themes.silver.editor.autocomplete.AutocompleteAriaTest', () => {
  Arr.each([ 'iframe', 'inline' ], (mode: string) => {
    context(mode, () => {
      afterEach(() => assertAutocompleteClosed());

      const assertAutocompleteClosed = () => {
        const editor = hook.editor();
        assert.isUndefined(Attribute.get(TinyDom.body(editor), 'aria-owns'));
        assert.isUndefined(Attribute.get(TinyDom.body(editor), 'aria-activedescendant'));
        UiFinder.notExists(TinyDom.documentElement(editor), '.tox-autocompleter');
      };

      const pSetContentAndTrigger = async (editor: Editor, triggerChar: string) => {
        const initialContent = triggerChar;

        editor.setContent(`<p>${initialContent}</p>`);
        TinySelections.setCursor(editor, [ 0, 0 ], initialContent.length);
        TinyContentActions.keypress(editor, triggerChar.charCodeAt(0));
        // Wait 50ms for the keypress to process
        await Waiter.pWait(50);
      };

      const pCloseAutocomplete = async (editor: Editor) => {
        TinyContentActions.keydown(editor, Keys.escape());
        return AutocompleterUtils.pWaitForAutocompleteToClose();
      };

      const getMenuItemIdByIndex = (autocompleter: SugarElement<Element>, index: number) => {
        const child = SelectorFilter.descendants(autocompleter, '[role="menuitem"]')[index];
        return Attribute.get(child, 'id');
      };

      const assertBodyAttributes = (editor: Editor, autocompleterId?: string, activeMenuItemId?: string) => {
        assert.equal(Attribute.get(TinyDom.body(editor), 'aria-owns'), autocompleterId);
        assert.equal(Attribute.get(TinyDom.body(editor), 'aria-activedescendant'), activeMenuItemId);
      };

      const hook = TinyHooks.bddSetupLight<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        inline: mode === 'inline',
        setup: (ed: Editor) => {
          ed.ui.registry.addAutocompleter('Plus1', {
            trigger: '+',
            minChars: 0,
            columns: 1,
            fetch: (pattern, _maxResults) => new Promise((resolve) => {
              const filteredItems = Arr.filter([ 'aA', 'bB', 'cC', 'dD' ], (letter) => letter.indexOf(pattern) !== -1);
              resolve(
                Arr.map(filteredItems, (letter) => ({
                  value: `plus-${letter}`,
                  text: `p-${letter}`,
                  icon: '+'
                }))
              );
            }),
            onAction: (autocompleteApi, rng, value) => {
              ed.selection.setRng(rng);
              ed.insertContent(value);
              autocompleteApi.hide();
            }
          });

          ed.ui.registry.addAutocompleter('Card items', {
            trigger: ':',
            minChars: 0,
            columns: 1,
            highlightOn: [ 'my_text_to_highlight' ],
            fetch: (pattern, _maxResults) => {
              const filteredItems = Arr.filter([
                { text: 'equals sign', value: '=' },
                { text: 'plus sign - D', value: '+' }
              ], (item) => item.text.indexOf(pattern) !== -1);
              return new Promise((resolve) => {
                resolve(
                  Arr.map(filteredItems, (item) => ({
                    value: `euro-${item.value}`,
                    ariaLabel: item.text,
                    type: 'cardmenuitem',
                    label: item.text,
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
                            text: item.text,
                            classes: [ 'my_text_class' ],
                            name: 'my_text_to_highlight'
                          }
                        ]
                      }
                    ]
                  }))
                );
              });
            },
            onAction: (autocompleteApi, rng, value) => {
              ed.selection.setRng(rng);
              ed.insertContent(value);
              autocompleteApi.hide();
            }
          });
        }
      }, [], true);

      Arr.each([
        { triggerChar: '+', label: 'autocomplete item' },
        { triggerChar: ':', label: 'cardmenu item' }
      ], (scenario: TestScenario) => {
        context(scenario.label, () => {
          it('TINY-9393: Attributes of editor body should be updated when autocomplete is shown', async () => {
            const editor = hook.editor();
            await pSetContentAndTrigger(editor, scenario.triggerChar);
            const autocompleter = await UiFinder.pWaitForVisible('Wait for autocompleter to appear', SugarBody.body(), '.tox-autocompleter');
            const autocompleterId = Attribute.get(autocompleter, 'id');
            const activeMenuItemId = getMenuItemIdByIndex(autocompleter, 0);
            assertBodyAttributes(editor, autocompleterId, activeMenuItemId);
            await pCloseAutocomplete(editor);
          });

          it('TINY-9393: Attributes of editor body should be updated when autocomplete is shown - changing active item', async () => {
            const editor = hook.editor();
            await pSetContentAndTrigger(editor, scenario.triggerChar);
            const autocompleter = await UiFinder.pWaitForVisible('Wait for autocompleter to appear', SugarBody.body(), '.tox-autocompleter');
            const autocompleterId = Attribute.get(autocompleter, 'id');
            const activeMenuItemId = getMenuItemIdByIndex(autocompleter, 0);
            assertBodyAttributes(editor, autocompleterId, activeMenuItemId);
            TinyContentActions.keydown(editor, Keys.down());
            const activeMenuItemId2 = getMenuItemIdByIndex(autocompleter, 1);
            assertBodyAttributes(editor, autocompleterId, activeMenuItemId2);
            await pCloseAutocomplete(editor);
          });

          it('TINY-9393: Attributes of editor body should be updated when autocomplete is shown - filtering autocompleter', async () => {
            const editor = hook.editor();
            await pSetContentAndTrigger(editor, scenario.triggerChar);
            const autocompleter = await UiFinder.pWaitForVisible('Wait for autocompleter to appear', SugarBody.body(), '.tox-autocompleter');
            const autocompleterId = Attribute.get(autocompleter, 'id');
            const activeMenuItemId = getMenuItemIdByIndex(autocompleter, 0);
            assertBodyAttributes(editor, autocompleterId, activeMenuItemId);

            editor.insertContent('D');
            TinyContentActions.keypress(editor, 'D'.charCodeAt(0));
            await Waiter.pWait(50);

            const activeMenuItemId2 = getMenuItemIdByIndex(autocompleter, 0);
            assertBodyAttributes(editor, autocompleterId, activeMenuItemId2);
            await pCloseAutocomplete(editor);
          });
        });
      });
    });
  });
});
