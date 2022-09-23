import { Keys, UiFinder, TestStore, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Throttler, Type } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import { getGreenImageDataUrl } from '../../../module/Assets';
import {
  AutocompleterStructure, pAssertAutocompleterStructure, pWaitForAutocompleteToClose, pWaitForAutocompleteToOpen
} from '../../../module/AutocompleterUtils';

interface TriggerDetails {
  readonly triggerChar: string;
  readonly initialContent?: string;
  readonly additionalContent?: string;
  readonly cursorPos?: {
    readonly elementPath: number[];
    readonly offset: number;
  };
}

interface Scenario extends TriggerDetails {
  readonly structure: AutocompleterStructure;
  readonly choice: (editor: Editor) => void;
  readonly assertion: (editor: Editor) => void;
}

describe('browser.tinymce.themes.silver.editor.autocomplete.AutocompleteTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addAutocompleter('Plus1', {
        trigger: '+',
        minChars: 0,
        columns: 1,
        fetch: (_pattern, _maxResults) => new Promise((resolve) => {
          resolve(
            Arr.map([ 'aA', 'bB', 'cC', 'dD' ], (letter) => ({
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

      ed.ui.registry.addAutocompleter('Colon1', {
        trigger: ':',
        minChars: 0,
        columns: 2,
        fetch: (_pattern, _maxResults) => new Promise((resolve) => {
          resolve(
            Arr.map([ 'a' ], (letter) => ({
              value: `colon1-${letter}`,
              text: `c1-${letter}`,
              icon: ':'
            }))
          );
        }),
        onAction: (autocompleteApi, _rng, value) => {
          store.adder('colon1:' + value)();
          autocompleteApi.hide();
        }
      });

      ed.ui.registry.addAutocompleter('Colon2', {
        trigger: ':',
        minChars: 0,
        columns: 2,
        fetch: (_pattern, _maxResults) => new Promise((resolve) => {
          resolve(
            Arr.map([ 'a', 'b' ], (letter) => ({
              value: `colon2-${letter}`,
              text: `c2-${letter}`,
              icon: ':'
            }))
          );
        }),
        onAction: (autocompleteApi, _rng, value) => {
          store.adder('colon2:' + value)();
          autocompleteApi.hide();
        }
      });

      ed.ui.registry.addAutocompleter('Tilde', {
        trigger: '~',
        minChars: 0,
        columns: 'auto',
        fetch: (_pattern, _maxResults) => new Promise((resolve) => {
          resolve(
            Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
              value: `tilde-${letter}`,
              text: `t-${letter}`,
              icon: '~'
            }))
          );
        }),
        onAction: (autocompleteApi, _rng, value) => {
          store.adder('tilde:' + value)();
          autocompleteApi.hide();
        }
      });

      ed.ui.registry.addAutocompleter('Exclamation', {
        trigger: '!',
        minChars: 0,
        columns: 1,
        fetch: (_pattern, _maxResults) => new Promise((resolve) => {
          resolve(
            Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
              value: `exclamation-${letter}`,
              text: `exclamation-${letter}`
            }))
          );
        }),
        onAction: (autocompleteApi, _rng, value) => {
          store.adder('exclamation:' + value)();
          autocompleteApi.hide();
        }
      });

      ed.ui.registry.addAutocompleter('Equals', {
        trigger: '=',
        minChars: 1,
        columns: 'auto',
        matches: (rng, text, _pattern) =>
          // Check the '=' is in the middle of a word
          rng.startOffset !== 0 && !/\s/.test(text.charAt(rng.startOffset - 1)),
        fetch: (pattern, _maxResults) => new Promise((resolve) => {
          const filteredItems = Arr.filter([ 'two', 'three' ], (number) => number.indexOf(pattern) !== -1);
          resolve(
            Arr.map(filteredItems, (number) => ({
              value: `${number}`,
              text: `${number}`,
              icon: '='
            }))
          );
        }),
        onAction: (autocompleteApi, rng, value) => {
          ed.selection.setRng(rng);
          ed.insertContent('=' + value);
          autocompleteApi.hide();
        }
      });

      ed.ui.registry.addAutocompleter('Asterisk', {
        trigger: '*',
        minChars: 2,
        columns: 'auto',
        fetch: (_pattern, _maxResults) => new Promise((resolve) => {
          resolve(
            Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
              value: `asterisk-${letter}`,
              text: `asterisk-${letter}`,
              icon: '*'
            }))
          );
        }),
        onAction: (autocompleteApi, rng, value) => {
          store.adder('asterisk:' + value)();
          ed.selection.setRng(rng);
          ed.insertContent(value);
          autocompleteApi.hide();
        }
      });

      ed.ui.registry.addAutocompleter('Hash with spaces', {
        trigger: '#',
        minChars: 1,
        columns: 1,
        fetch: (pattern, _maxResults) => {
          const filteredItems = Arr.filter([
            { text: 'dollar sign', value: '$' },
            { text: 'equals sign', value: '=' },
            { text: 'some name', value: '`' }
          ], (item) => item.text.indexOf(pattern) !== -1);
          return new Promise((resolve) => {
            resolve(
              Arr.map(filteredItems, (item) => ({
                value: `hash-${item.value}`,
                text: `${item.text}`
              }))
            );
          });
        },
        onAction: (autocompleteApi, rng, value) => {
          store.adder('hash:' + value)();
          ed.selection.setRng(rng);
          ed.insertContent(value);
          autocompleteApi.hide();
        }
      });

      ed.ui.registry.addAutocompleter('Card items', {
        trigger: '€',
        minChars: 1,
        columns: 1,
        highlightOn: [ 'my_text_to_highlight' ],
        fetch: (pattern, _maxResults) => {
          const filteredItems = Arr.filter([
            { text: 'equals sign', value: '=' },
            { text: 'plus sign', value: '+' }
          ], (item) => item.text.indexOf(pattern) !== -1);
          return new Promise((resolve) => {
            resolve(
              Arr.map(filteredItems, (item) => ({
                value: `euro-${item.value}`,
                ariaLabel: item.text,
                type: 'cardmenuitem',
                label: item.text,
                onAction: () => {
                  store.add('euro:AutocompleterContents->onAction');
                },
                items: [
                  {
                    type: 'cardimage',
                    src: getGreenImageDataUrl(),
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
          store.adder('euro:' + value)();
          ed.selection.setRng(rng);
          ed.insertContent(value);
          autocompleteApi.hide();
        }
      });

      const dollarsFetch = Throttler.last((resolve) => {
        resolve(
          Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
            value: `dollars-${letter}`,
            text: `d-${letter}`,
            icon: '$'
          }))
        );
      }, 100);
      ed.ui.registry.addAutocompleter('Dollars1', {
        trigger: '$',
        minChars: 0,
        columns: 1,
        fetch: (_pattern, _maxResults) => new Promise(dollarsFetch.throttle),
        onAction: (autocompleteApi, rng, value) => {
          store.adder('dollars:' + value)();
          ed.selection.setRng(rng);
          ed.insertContent(value);
          autocompleteApi.hide();
        }
      });

      ed.ui.registry.addAutocompleter('Multi1', {
        trigger: '^@@',
        minChars: 0,
        columns: 1,
        fetch: (_pattern, _maxResults) => new Promise((resolve) => {
          resolve(
            Arr.map([ 'aA', 'bB', 'cC', 'dD' ], (letter) => ({
              value: `multi-${letter}`,
              text: `mu-${letter}`,
              icon: '^'
            }))
          );
        }),
        onAction: (autocompleteApi, rng, value) => {
          ed.selection.setRng(rng);
          ed.insertContent(value);
          autocompleteApi.hide();
        }
      });
    }
  }, [], true);

  beforeEach(() => {
    store.clear();
  });

  const pSetContentAndTrigger = async (editor: Editor, details: TriggerDetails, triggerOverride?: number) => {
    const initialContent = details.initialContent || details.triggerChar;
    const additionalContent = details.additionalContent;

    editor.setContent(`<p>${initialContent}</p>`);
    if (Type.isNonNullable(details.cursorPos)) {
      TinySelections.setCursor(editor, details.cursorPos.elementPath, details.cursorPos.offset);
    } else {
      TinySelections.setCursor(editor, [ 0, 0 ], initialContent.length);
    }
    TinyContentActions.keypress(editor, triggerOverride || details.triggerChar.charCodeAt(0));
    // Wait 50ms for the keypress to process
    await Waiter.pWait(50);
    if (Type.isNonNullable(additionalContent)) {
      editor.execCommand('mceInsertContent', false, additionalContent);
      TinyContentActions.keypress(editor, additionalContent.charCodeAt(additionalContent.length - 1));
    }
  };

  const pTestAutocompleter = async (scenario: Scenario) => {
    const editor = hook.editor();
    await pSetContentAndTrigger(editor, scenario);
    await pWaitForAutocompleteToOpen();
    await pAssertAutocompleterStructure(scenario.structure);
    scenario.choice(editor);
    await pWaitForAutocompleteToClose();
    scenario.assertion(editor);
  };

  it('Checking first autocomplete (columns = 1) trigger: "+"', () => pTestAutocompleter({
    triggerChar: '+',
    structure: {
      type: 'list',
      hasIcons: true,
      groups: [
        [
          { title: 'p-aA', text: 'p-aA', icon: '+' },
          { title: 'p-bB', text: 'p-bB', icon: '+' },
          { title: 'p-cC', text: 'p-cC', icon: '+' },
          { title: 'p-dD', text: 'p-dD', icon: '+' }
        ]
      ]
    },
    choice: (editor) => {
      TinyContentActions.keydown(editor, Keys.down());
      TinyContentActions.keydown(editor, Keys.enter());
    },
    assertion: (editor) => TinyAssertions.assertContent(editor, '<p>plus-bB</p>')
  }));

  it('Checking first autocomplete (columns = 1) trigger: "+" with existing character', () => pTestAutocompleter({
    triggerChar: '+a',
    structure: {
      type: 'list',
      hasIcons: true,
      groups: [
        [
          { title: 'p-aA', text: 'p-<span class="tox-autocompleter-highlight">a</span><span class="tox-autocompleter-highlight">A</span>', icon: '+' },
          { title: 'p-bB', text: 'p-bB', icon: '+' },
          { title: 'p-cC', text: 'p-cC', icon: '+' },
          { title: 'p-dD', text: 'p-dD', icon: '+' }
        ]
      ]
    },
    choice: (editor) => {
      TinyContentActions.keydown(editor, Keys.down());
      TinyContentActions.keydown(editor, Keys.enter());
    },
    assertion: (editor) => TinyAssertions.assertContent(editor, '<p>plus-bB</p>')
  }));

  it('Checking second autocomplete (columns = 2), two sources, trigger ":"', () => pTestAutocompleter({
    triggerChar: ':',
    structure: {
      type: 'grid',
      groups: [
        [
          { title: 'c1-a', icon: ':' },
          { title: 'c2-a', icon: ':' }
        ],
        [
          { title: 'c2-b', icon: ':' }
        ]
      ]
    },
    choice: (editor) => {
      TinyContentActions.keydown(editor, Keys.down());
      TinyContentActions.keydown(editor, Keys.enter());
    },
    assertion: () => store.assertEq('Second action should fire', [ 'colon2:colon2-b' ])
  }));

  it('Checking third autocomplete (columns = auto) trigger: "~"', () => pTestAutocompleter({
    triggerChar: '~',
    structure: {
      type: 'grid',
      groups: [
        [
          { title: 't-a', icon: '~' },
          { title: 't-b', icon: '~' },
          { title: 't-c', icon: '~' },
          { title: 't-d', icon: '~' }
        ]
      ]
    },
    choice: (editor) => {
      TinyContentActions.keydown(editor, Keys.right());
      TinyContentActions.keydown(editor, Keys.right());
      TinyContentActions.keydown(editor, Keys.enter());
    },
    assertion: () => store.assertEq('Tilde-c should fire', [ 'tilde:tilde-c' ])
  }));

  it('Checking forth autocomplete, (columns = 1), trigger: "!", no icons', () => pTestAutocompleter({
    triggerChar: '!',
    structure: {
      type: 'list',
      hasIcons: false,
      groups: [
        [
          { title: 'exclamation-a', text: 'exclamation-a' },
          { title: 'exclamation-b', text: 'exclamation-b' },
          { title: 'exclamation-c', text: 'exclamation-c' },
          { title: 'exclamation-d', text: 'exclamation-d' }
        ]
      ]
    },
    choice: (editor) => {
      TinyContentActions.keydown(editor, Keys.down());
      TinyContentActions.keydown(editor, Keys.down());
      TinyContentActions.keydown(editor, Keys.enter());
    },
    assertion: () => store.assertEq('Exclamation-c should fire', [ 'exclamation:exclamation-c' ])
  }));

  it('Checking fifth autocomplete, trigger: "=", custom activation check', () => pTestAutocompleter({
    triggerChar: '=',
    initialContent: 'test=t',
    structure: {
      type: 'grid',
      groups: [
        [
          { title: 'two', icon: '=' },
          { title: 'three', icon: '=' }
        ]
      ]
    },
    choice: (editor) => TinyContentActions.keydown(editor, Keys.enter()),
    assertion: (editor) => TinyAssertions.assertContent(editor, '<p>test=two</p>')
  }));

  it('Checking sixth autocomplete, (columns = 1), trigger: "#", content has spaces', () => pTestAutocompleter({
    triggerChar: '#',
    initialContent: '#equ',
    additionalContent: 'als s',
    structure: {
      type: 'list',
      hasIcons: false,
      groups: [
        [
          { title: 'equals sign', text: '<span class="tox-autocompleter-highlight">equals s</span>ign' }
        ]
      ]
    },
    choice: (editor) => TinyContentActions.keydown(editor, Keys.enter()),
    assertion: () => store.assertEq('Hash-= should fire', [ 'hash:hash-=' ])
  }));

  it('Checking autocomplete over fragmented text', () => pTestAutocompleter({
    triggerChar: '*',
    initialContent: '*<span data-mce-spelling="invalid">ha</span>p',
    cursorPos: {
      elementPath: [ 0, 2 ],
      offset: 1
    },
    structure: {
      type: 'grid',
      groups: [
        [
          { title: 'asterisk-a', icon: '*' },
          { title: 'asterisk-b', icon: '*' },
          { title: 'asterisk-c', icon: '*' },
          { title: 'asterisk-d', icon: '*' }
        ]
      ]
    },
    choice: (editor) => TinyContentActions.keydown(editor, Keys.enter()),
    assertion: (editor) => TinyAssertions.assertContent(editor, '<p>asterisk-a</p>')
  }));

  context('Autocomplete start of word detection', () => {
    it('No spaces', async () => {
      const editor = hook.editor();
      await pSetContentAndTrigger(editor, {
        triggerChar: '*',
        initialContent: 'a*',
        additionalContent: 'bc'
      });
      // Can't wait for anything to change, so just wait for a prefixed amount of time
      await Waiter.pWait(500);
      UiFinder.notExists(SugarBody.body(), '.tox-autocompleter');
      await pSetContentAndTrigger(editor, {
        triggerChar: '*',
        additionalContent: 'bc'
      });
      await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter div[role="menu"]');
      await pAssertAutocompleterStructure({
        type: 'grid',
        groups: [
          [
            { title: 'asterisk-a', icon: '*' },
            { title: 'asterisk-b', icon: '*' },
            { title: 'asterisk-c', icon: '*' },
            { title: 'asterisk-d', icon: '*' }
          ]
        ]
      });
      TinyContentActions.keydown(editor, Keys.enter());
      await pWaitForAutocompleteToClose();
    });

    it('Immediately after a br element', async () => {
      const editor = hook.editor();
      await pSetContentAndTrigger(editor, {
        initialContent: 'First line<br>*',
        triggerChar: '*',
        additionalContent: 'bc',
        cursorPos: {
          elementPath: [ 0, 2 ],
          offset: 1
        }
      });
      await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter div[role="menu"]');
      await pAssertAutocompleterStructure({
        type: 'grid',
        groups: [
          [
            { title: 'asterisk-a', icon: '*' },
            { title: 'asterisk-b', icon: '*' },
            { title: 'asterisk-c', icon: '*' },
            { title: 'asterisk-d', icon: '*' }
          ]
        ]
      });
      TinyContentActions.keydown(editor, Keys.enter());
      await pWaitForAutocompleteToClose();
    });

    it('Immediately after a ce=false element', async () => {
      const editor = hook.editor();
      await pSetContentAndTrigger(editor, {
        initialContent: 'Some content <span contenteditable="false">uneditable content</span>*',
        triggerChar: '*',
        additionalContent: 'bc',
        cursorPos: {
          elementPath: [ 0, 2 ],
          offset: 1
        }
      });
      await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter div[role="menu"]');
      await pAssertAutocompleterStructure({
        type: 'grid',
        groups: [
          [
            { title: 'asterisk-a', icon: '*' },
            { title: 'asterisk-b', icon: '*' },
            { title: 'asterisk-c', icon: '*' },
            { title: 'asterisk-d', icon: '*' }
          ]
        ]
      });
      TinyContentActions.keydown(editor, Keys.enter());
      await pWaitForAutocompleteToClose();
    });

    it('TINY-8759: In a nested list', async () => {
      const editor = hook.editor();
      await pSetContentAndTrigger(editor, {
        initialContent: '<ul><li>Text<ul><li>*</li></ul></li></ul>',
        triggerChar: '*',
        additionalContent: 'bc',
        cursorPos: {
          elementPath: [ 1, 0, 1, 0 ],
          offset: 1
        }
      });
      await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter div[role="menu"]');
      await pAssertAutocompleterStructure({
        type: 'grid',
        groups: [
          [
            { title: 'asterisk-a', icon: '*' },
            { title: 'asterisk-b', icon: '*' },
            { title: 'asterisk-c', icon: '*' },
            { title: 'asterisk-d', icon: '*' }
          ]
        ]
      });
      TinyContentActions.keydown(editor, Keys.enter());
      await pWaitForAutocompleteToClose();
    });
  });

  it('Checking autocomplete activation based on content', async () => {
    const editor = hook.editor();
    await pSetContentAndTrigger(editor, {
      triggerChar: '=',
      initialContent: 'test='
    });
    // Can't wait for anything to change, so just wait for a prefixed amount of time
    await Waiter.pWait(500);
    UiFinder.notExists(SugarBody.body(), '.tox-autocompleter');
    await pSetContentAndTrigger(editor, {
      triggerChar: '=',
      initialContent: 'test=t'
    });
    await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter div[role="menu"]');
    await pAssertAutocompleterStructure({
      type: 'grid',
      groups: [
        [
          { title: 'two', icon: '=' },
          { title: 'three', icon: '=' }
        ]
      ]
    });
    TinyAssertions.assertContent(editor, '<p>test=t</p>');
    // Check the options shrink to 1 item
    await pSetContentAndTrigger(editor, {
      triggerChar: '=',
      initialContent: 'test=tw'
    }, 'w'.charCodeAt(0));
    await pAssertAutocompleterStructure({
      type: 'grid',
      groups: [
        [
          { title: 'two', icon: '=' }
        ]
      ]
    });
    TinyAssertions.assertContent(editor, '<p>test=tw</p>');
    // Check the autocompleter is hidden/closed when no items match
    await pSetContentAndTrigger(editor, {
      triggerChar: '=',
      initialContent: 'test=twe'
    }, 'e'.charCodeAt(0));
    await pWaitForAutocompleteToClose();
    TinyAssertions.assertContent(editor, '<p>test=twe</p>');
    // Check the autocompleter is shown again when deleting a char
    await pSetContentAndTrigger(editor, {
      triggerChar: '=',
      initialContent: 'test=tw'
    }, Keys.backspace());
    await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter div[role="menu"]');
    await pAssertAutocompleterStructure({
      type: 'grid',
      groups: [
        [
          { title: 'two', icon: '=' }
        ]
      ]
    });
    TinyContentActions.keydown(editor, Keys.enter());
    await pWaitForAutocompleteToClose();
  });

  it('Checking autocomplete with card menu items, trigger: "€"', () => pTestAutocompleter({
    triggerChar: '€',
    initialContent: '€equ',
    additionalContent: 'als s',
    structure: {
      type: 'list',
      hasIcons: false,
      groups: [
        [
          (s, str, arr) => s.element('div', {
            classes: [ arr.has('tox-collection__item') ],
            attrs: {
              title: str.is('equals sign')
            },
            children: [
              s.element('div', {
                classes: [
                  arr.has('tox-collection__item-container--row'),
                  arr.has('tox-collection__item-container')
                ],
                children: [
                  s.element('img', {
                    classes: [ arr.has('my_autocompleter_avatar_class') ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-collection__item-container--column'),
                      arr.has('tox-collection__item-container--align-right'),
                      arr.has('tox-collection__item-container--valign-bottom')
                    ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('my_text_class') ],
                        html: str.is('<span class="tox-autocompleter-highlight">equals s</span>ign')
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      ]
    },
    choice: (editor) => TinyContentActions.keydown(editor, Keys.enter()),
    assertion: () => store.assertEq('Euro-= should fire', [ 'euro:AutocompleterContents->onAction', 'euro:euro-=' ])
  }));

  it('TINY-8552: Checking menu can be closed with a throttled fetch (trigger: $)', () => pTestAutocompleter({
    triggerChar: '$',
    additionalContent: 'a',
    structure: {
      type: 'list',
      hasIcons: true,
      groups: [
        [
          { title: 'd-a', text: 'd-<span class="tox-autocompleter-highlight">a</span>', icon: '$' },
          { title: 'd-b', text: 'd-b', icon: '$' },
          { title: 'd-c', text: 'd-c', icon: '$' },
          { title: 'd-d', text: 'd-d', icon: '$' }
        ]
      ]
    },
    choice: (editor) => TinyContentActions.keydown(editor, Keys.enter()),
    assertion: (editor) => TinyAssertions.assertContent(editor, '<p>dollars-a</p>')
  }));

  it('TINY-8887: Checking multi-char trigger: "^@@" splitted over several text nodes', () => pTestAutocompleter({
    triggerChar: '^@@',
    initialContent: '<strong>^</strong>@',
    additionalContent: '@',
    cursorPos: {
      elementPath: [ 0, 1 ],
      offset: 1
    },
    structure: {
      type: 'list',
      hasIcons: true,
      groups: [
        [
          { title: 'mu-aA', text: 'mu-aA', icon: '^' },
          { title: 'mu-bB', text: 'mu-bB', icon: '^' },
          { title: 'mu-cC', text: 'mu-cC', icon: '^' },
          { title: 'mu-dD', text: 'mu-dD', icon: '^' }
        ]
      ]
    },
    choice: (editor) => {
      TinyContentActions.keydown(editor, Keys.down());
      TinyContentActions.keydown(editor, Keys.enter());
    },
    assertion: (editor) => TinyAssertions.assertContent(editor, '<p>multi-bB</p>')
  }));
});
