import { describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { InlineContent } from 'tinymce/core/api/ui/Ui';

import { pAssertAutocompleterStructure, pWaitForAutocompleteToOpen } from '../../../module/AutocompleterUtils';

interface Scenario {
  readonly action: (editor: Editor) => Promise<void>;
  readonly assertion: (editor: Editor) => Promise<void>;
}

interface ScenarioWithPostAction extends Scenario {
  readonly postAction: (editor: Editor) => Promise<void>;
  readonly postAssertion: (editor: Editor) => Promise<void>;
}

const hasPostActions = (scenario: any): scenario is ScenarioWithPostAction =>
  Obj.hasNonNullableKey(scenario, 'postAction');

describe('Editor Autocompleter Reload test', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addAutocompleter('Colon', {
        trigger: ':',
        minChars: 1,
        columns: 1,
        fetch: (pattern, maxResults, meta) => {
          const prefix = Obj.get(meta, 'prefix').getOr('');
          return new Promise((resolve) => {
            const items: InlineContent.AutocompleterContents[] = Arr.map([ 'a', 'b', 'c', 'd' ], (item) => ({
              value: `item-${item}`,
              text: `${prefix}${item}`
            }));

            const extras: InlineContent.AutocompleterContents[] = Obj.keys(meta).length === 0 ? [
              { type: 'separator' },
              { value: '', text: 'Load more...', meta: { reload: true }}
            ] : [ ];

            resolve([
              ...items,
              ...extras
            ]);
          });
        },
        onAction: (autocompleteApi, rng, value, meta) => {
          if (meta.reload === true) {
            autocompleteApi.reload({ prefix: 'r' });
          } else {
            autocompleteApi.hide();
          }
        }
      });
    }
  }, [], true);

  const pAssertInitialMenu = () => pAssertAutocompleterStructure({
    type: 'list',
    hasIcons: false,
    groups: [
      [
        { title: 'a', text: 'a' },
        { title: 'b', text: 'b' },
        { title: 'c', text: 'c' },
        { title: 'd', text: 'd' }
      ],
      [
        { title: 'Load more...', text: 'Load more...' }
      ]
    ]
  });

  const pAssertReloadedMenu = () => pAssertAutocompleterStructure({
    type: 'list',
    hasIcons: false,
    groups: [
      [
        { title: 'ra', text: 'ra' },
        { title: 'rb', text: 'rb' },
        { title: 'rc', text: 'rc' },
        { title: 'rd', text: 'rd' }
      ]
    ]
  });

  const pSetContentAndTrigger = async (editor: Editor, content: string, triggerCharCode: number) => {
    editor.setContent(`<p>${content}</p>`);
    TinySelections.setCursor(editor, [ 0, 0 ], content.length);
    TinyContentActions.keypress(editor, triggerCharCode);
    await pWaitForAutocompleteToOpen();
  };

  const pTestAutocompleter = async (scenario: Scenario | ScenarioWithPostAction) => {
    const editor = hook.editor();
    await pSetContentAndTrigger(editor, ':aa', ':'.charCodeAt(0));
    await scenario.action(editor);
    await scenario.assertion(editor);
    if (hasPostActions(scenario)) {
      await scenario.postAction(editor);
      await scenario.postAssertion(editor);
    }
  };

  it('Trigger autocompleter and reload items', () => pTestAutocompleter({
    action: () => Promise.resolve(),
    assertion: pAssertInitialMenu,
    postAction: async (editor) => {
      TinyUiActions.clickOnUi(editor, '.tox-collection__item:contains("Load more...")');
      await TinyUiActions.pWaitForUi(editor, '.tox-collection__item:contains("ra")');
    },
    postAssertion: pAssertReloadedMenu
  }));
});
