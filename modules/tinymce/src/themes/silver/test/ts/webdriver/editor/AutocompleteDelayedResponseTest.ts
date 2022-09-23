import { Keys, RealKeys, TestStore, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import { AutocompleterStructure, pAssertAutocompleterStructure, pWaitForAutocompleteToClose } from '../../module/AutocompleterUtils';

interface Scenario {
  readonly triggerChar: string;
  readonly structure: AutocompleterStructure;
  readonly choice: (editor: Editor) => void;
  readonly assertion: (editor: Editor) => void;
  readonly initialContent?: string;
  readonly additionalContent?: string;
  readonly cursorPos?: {
    readonly elementPath: number[];
    readonly offset: number;
  };
}

describe('webdriver.tinymce.themes.silver.editor.AutocompleteDelayedResponseTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addAutocompleter('Dollars', {
        trigger: '$',
        minChars: 0,
        columns: 'auto',
        fetch: (_pattern, _maxResults) => new Promise((resolve) => {
          setTimeout(() => {
            resolve(
              Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
                value: `dollar-${letter}`,
                text: `dollar-${letter}`,
                icon: '$'
              }))
            );
          }, 500);
        }),
        onAction: (autocompleteApi, rng, value) => {
          store.adder('dollars:' + value)();
          ed.selection.setRng(rng);
          ed.insertContent(value);
          autocompleteApi.hide();
        }
      });
    }
  }, [], true);

  const pTestAutocompleter = async (scenario: Scenario) => {
    const editor = hook.editor();
    const initialContent = scenario.initialContent || scenario.triggerChar;
    const additionalContent = scenario.additionalContent;

    store.clear();
    editor.setContent('<p></p>');
    await RealKeys.pSendKeysOn(
      'iframe => body => p',
      [
        RealKeys.text(initialContent)
      ]
    );
    // Wait 50ms for the keypress handler to run
    await Waiter.pWait(50);
    if (Type.isNonNullable(additionalContent)) {
      await RealKeys.pSendKeysOn(
        'iframe => body => p',
        [
          RealKeys.text(additionalContent)
        ]
      );
    }
    await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter div[role="menu"]');
    await pAssertAutocompleterStructure(scenario.structure);
    scenario.choice(editor);
    await pWaitForAutocompleteToClose();
    scenario.assertion(editor);
  };

  it('Checking delayed autocomplete, (columns = auto), trigger: "$"', () => pTestAutocompleter({
    triggerChar: '$',
    initialContent: '$a',
    additionalContent: 'aa',
    structure: {
      type: 'grid',
      groups: [
        [
          { title: 'dollar-a', icon: '$' },
          { title: 'dollar-b', icon: '$' },
          { title: 'dollar-c', icon: '$' },
          { title: 'dollar-d', icon: '$' }
        ]
      ]
    },
    choice: (editor) => TinyContentActions.keydown(editor, Keys.enter()),
    assertion: (editor) => TinyAssertions.assertContent(editor, '<p>dollar-a</p>')
  }));
});
