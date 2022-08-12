import { ApproxStructure, Keys, Mouse, StructAssert, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import { pWaitForAutocompleteToClose } from '../../../module/AutocompleterUtils';

interface Scenario {
  readonly setup?: (editor: Editor) => Promise<void>;
  readonly action: (editor: Editor) => void;
  readonly postAction?: (editor: Editor) => void;
  readonly assertion: ApproxStructure.Builder<StructAssert[]>;
}

describe('browser.tinymce.themes.silver.editor.autocomplete.AutocompleteCancelTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addAutocompleter('Colon', {
        trigger: ':',
        minChars: 1,
        columns: 'auto',
        fetch: (pattern, _maxResults) => {
          const filteredItems = Arr.filter([ 'a', 'b', 'c', 'd' ], (item) => item.indexOf(pattern) !== -1);
          return new Promise((resolve) => {
            resolve(
              Arr.map(filteredItems, (item) => ({
                value: `colon-${item}`,
                text: `${item}`,
                icon: ':'
              }))
            );
          });
        },
        onAction: (autocompleteApi, _rng, _value) => {
          autocompleteApi.hide();
        }
      });
    }
  }, [], true);

  const expectedSimplePara = (content: string): ApproxStructure.Builder<StructAssert> => (s, str, _arr) => s.element('p', {
    children: [ s.text(str.is(content), true) ]
  });

  const expectedAutocompletePara = (content: string): ApproxStructure.Builder<StructAssert> => (s, str, _arr) => s.element('p', {
    children: [
      s.element('span', {
        attrs: {
          'data-mce-autocompleter': str.is('1'),
          'data-mce-bogus': str.is('1')
        },
        children: [ s.text(str.is(content), true) ]
      })
    ]
  });

  const setContentAndTrigger = (editor: Editor, content: string, triggerCharCode: number, template?: string, elementPath?: number[]) => {
    const htmlTemplate = template || '<p>CONTENT</p>';
    editor.setContent(htmlTemplate.replace('CONTENT', content));
    TinySelections.setCursor(editor, elementPath || [ 0, 0 ], content.length);
    TinyContentActions.keypress(editor, triggerCharCode);
  };

  const insertContentAndTrigger = (editor: Editor, content: string) => {
    editor.execCommand('mceInsertContent', false, content);
    TinyContentActions.keypress(editor, content.charCodeAt(content.length - 1));
  };

  const pAssertContent = (label: string, editor: Editor, expected: ApproxStructure.Builder<StructAssert[]>) =>
    Waiter.pTryUntil(label, () => TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str, arr) => s.element('body', {
        children: expected(s, str, arr)
      }))
    ));

  const pTriggerAndAssertInitialContent = async (editor: Editor, template?: string, elementPath?: number[], expected?: ApproxStructure.Builder<StructAssert[]>) => {
    setContentAndTrigger(editor, ':a', ':'.charCodeAt(0), template, elementPath);
    await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter div[role="menu"]');
    await pAssertContent('Check initial content with autocompleter active', editor, (s, str, arr) => {
      return expected ? expected(s, str, arr) : [ expectedAutocompletePara(':a')(s, str, arr) ];
    });
  };

  const pTestAutocompleter = async (scenario: Scenario) => {
    const editor = hook.editor();
    const setup = scenario.setup ? scenario.setup : pTriggerAndAssertInitialContent;
    await setup(editor);
    scenario.action(editor);
    await pWaitForAutocompleteToClose();
    if (Type.isNonNullable(scenario.postAction)) {
      scenario.postAction(editor);
    }
    await pAssertContent('Check autocompleter was cancelled', editor, scenario.assertion);
  };

  it('Checking escape in menu cancels the autocompleter', () => pTestAutocompleter({
    action: (editor) => TinyContentActions.keydown(editor, Keys.escape()),
    assertion: (s, str, arr) => [ expectedSimplePara(':a')(s, str, arr) ]
  }));

  it('Checking inserting a new line cancels the autocompleter', () => pTestAutocompleter({
    action: (editor) => insertContentAndTrigger(editor, 'aa'),
    postAction: (editor) => TinyContentActions.keydown(editor, Keys.enter()),
    assertion: (s, str, arr) => [
      expectedSimplePara(':aaa')(s, str, arr),
      s.element('p', {})
    ]
  }));

  it('Checking deleting trigger char cancels the autocompleter', () => pTestAutocompleter({
    action: (editor) => {
      editor.execCommand('delete');
      editor.execCommand('delete');
      TinyContentActions.keydown(editor, Keys.backspace());
    },
    assertion: (s) => [
      s.element('p', {
        children: [
          s.element('br', { })
        ]
      })
    ]
  }));

  it('Checking pressing down cancels the autocompleter', () => pTestAutocompleter({
    setup: (editor) => pTriggerAndAssertInitialContent(editor, '<p></p><p>CONTENT</p><p></p>', [ 1, 0 ], (s, str, arr) => [
      s.element('p', {}),
      expectedAutocompletePara(':a')(s, str, arr),
      s.element('p', {})
    ]),
    action: (editor) => insertContentAndTrigger(editor, 'aa'),
    postAction: (editor) => TinyContentActions.keydown(editor, Keys.down()),
    assertion: (s, str, arr) => [
      s.element('p', {}),
      expectedSimplePara(':aaa')(s, str, arr),
      s.element('p', {})
    ]
  }));

  it('Checking pressing up cancels the autocompleter', () => pTestAutocompleter({
    setup: (editor) => pTriggerAndAssertInitialContent(editor, '<p></p><p>CONTENT</p><p></p>', [ 1, 0 ], (s, str, arr) => [
      s.element('p', {}),
      expectedAutocompletePara(':a')(s, str, arr),
      s.element('p', {})
    ]),
    action: (editor) => insertContentAndTrigger(editor, 'aa'),
    postAction: (editor) => TinyContentActions.keydown(editor, Keys.up()),
    assertion: (s, str, arr) => [
      s.element('p', {}),
      expectedSimplePara(':aaa')(s, str, arr),
      s.element('p', {})
    ]
  }));

  it('Checking inserting at least 10 chars after no matches cancels the autocompleter', () => pTestAutocompleter({
    action: (editor) => insertContentAndTrigger(editor, 'aaaaaaaaaa'),
    assertion: (s, str, arr) => [ expectedSimplePara(':aaaaaaaaaaa')(s, str, arr) ]
  }));

  it('Checking changing to different node cancels the autocompleter', async () => {
    const editor = hook.editor();
    await pTriggerAndAssertInitialContent(editor, '<p>CONTENT</p><p>new node</p>', [ 0, 0 ], (s, str, arr) => [
      expectedAutocompletePara(':a')(s, str, arr),
      s.element('p', {})
    ]);
    insertContentAndTrigger(editor, 'aa');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
    await pWaitForAutocompleteToClose();
    await pAssertContent('Check autocompleter was not cancelled', editor, (s, str, arr) => [
      expectedAutocompletePara(':aaa')(s, str, arr),
      s.element('p', {})
    ]);
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    await pAssertContent('Check autocompleter was cancelled', editor, (s, str, arr) => [
      expectedSimplePara(':aaa')(s, str, arr),
      s.element('p', {})
    ]);
  });

  it('Checking clicking outside cancels the autocompleter', () => pTestAutocompleter({
    setup: (editor) => pTriggerAndAssertInitialContent(editor, '<p>CONTENT</p><p>new node</p>', [ 0, 0 ], (s, str, arr) => [
      expectedAutocompletePara(':a')(s, str, arr),
      s.element('p', {})
    ]),
    action: (editor) => Mouse.trueClickOn(TinyDom.body(editor), 'p:contains(new node)'),
    assertion: (s, str, arr) => [
      expectedSimplePara(':a')(s, str, arr),
      s.element('p', { })
    ]
  }));
});
