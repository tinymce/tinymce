import 'tinymce/themes/silver/Theme';

import { Logger, Pipeline, Keyboard, Step, Keys, UiFinder, GeneralSteps, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import { TinyLoader, TinyUi, TinyApis } from '@ephox/mcagar';
import { Element, Body } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import { AutocompleterStructure, sAssertAutocompleterStructure, sWaitForAutocompleteToClose } from '../../module/AutocompleterUtils';

UnitTest.asynctest('Editor Autocompleter test', (success, failure) => {
  const store = TestHelpers.TestStore();

  interface Scenario {
    triggerChar: string;
    structure: AutocompleterStructure;
    choice: Step<any, any>;
    assertion: Step<any, any>;
    initialContent?: string;
    additionalContent?: string;
    cursorPos?: {
      elementPath: number[];
      offset: number;
    };
  }

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);

      const eDoc = Element.fromDom(editor.getDoc());

      const sTestAutocompleter = (scenario: Scenario) => {
        const initialContent = scenario.initialContent || scenario.triggerChar;
        const additionalContent = scenario.additionalContent;
        return GeneralSteps.sequence([
          store.sClear,
          tinyApis.sSetContent(`<p>${initialContent}</p>`),
          scenario.cursorPos ? tinyApis.sSetCursor(scenario.cursorPos.elementPath, scenario.cursorPos.offset) : tinyApis.sSetCursor([ 0, 0 ], initialContent.length),
          Keyboard.sKeypress(eDoc, scenario.triggerChar.charCodeAt(0), { }),
          tinyUi.sWaitForPopup('wait for autocompleter to appear', '.tox-autocompleter div[role="menu"]'),
          ...additionalContent ? [
            tinyApis.sExecCommand('mceInsertContent', additionalContent),
            Keyboard.sKeypress(eDoc, additionalContent.charCodeAt(additionalContent.length - 1), { }),
          ] : [],
          sAssertAutocompleterStructure(scenario.structure),
          scenario.choice,
          sWaitForAutocompleteToClose,
          scenario.assertion
        ]);
      };

      const sTestFirstAutocomplete = sTestAutocompleter({
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
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.down(), { }),
          Keyboard.sKeydown(eDoc, Keys.enter(), { })
        ]),
        assertion: tinyApis.sAssertContent('<p>plus-bB</p>')
      });

      const sTestFirstAutocomplete2 = sTestAutocompleter({
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
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.down(), { }),
          Keyboard.sKeydown(eDoc, Keys.enter(), { })
        ]),
        assertion: tinyApis.sAssertContent('<p>plus-bB</p>')
      });

      const sTestSecondAutocomplete = sTestAutocompleter({
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
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.down(), { }),
          Keyboard.sKeydown(eDoc, Keys.enter(), { }),
        ]),
        assertion: store.sAssertEq('Second action should fire', [ 'colon2:colon2-b' ])
      });

      const sTestThirdAutocomplete = sTestAutocompleter({
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
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.right(), { }),
          Keyboard.sKeydown(eDoc, Keys.right(), { }),
          Keyboard.sKeydown(eDoc, Keys.enter(), { })
        ]),
        assertion: store.sAssertEq('Tilde-c should fire', [ 'tilde:tilde-c' ])
      });

      const sTestFourthAutocomplete = sTestAutocompleter({
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
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.down(), { }),
          Keyboard.sKeydown(eDoc, Keys.down(), { }),
          Keyboard.sKeydown(eDoc, Keys.enter(), { })
        ]),
        assertion: store.sAssertEq('Exclamation-c should fire', [ 'exclamation:exclamation-c' ])
      });

      const sTestFifthAutocomplete = sTestAutocompleter({
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
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.enter(), { })
        ]),
        assertion: tinyApis.sAssertContent('<p>test=two</p>')
      });

      const sTestSixthAutocomplete = sTestAutocompleter({
        triggerChar: '#',
        initialContent: '#equ',
        additionalContent: 'als s',
        structure: {
          type: 'list',
          hasIcons: false,
          groups: [
            [
              { title: 'equals sign', text: '<span class="tox-autocompleter-highlight">equals s</span>ign' },
            ]
          ]
        },
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.enter(), { })
        ]),
        assertion: store.sAssertEq('Hash-= should fire', [ 'hash:hash-=' ])
      });

      const sTestAutocompleteFragmentedText = sTestAutocompleter({
        triggerChar: '*',
        initialContent: '*<span data-mce-spelling="invalid">ha</span>p',
        cursorPos: {
          elementPath: [0, 2],
          offset: 1,
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
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.enter(), { })
        ]),
        assertion: tinyApis.sAssertContent('<p>asterisk-a</p>')
      });

      const sSetContentAndTrigger = (content: string, triggerCharCode: number) => {
        return GeneralSteps.sequence([
          tinyApis.sSetContent(`<p>${content}</p>`),
          tinyApis.sSetCursor([ 0, 0 ], content.length),
          Keyboard.sKeydown(eDoc, triggerCharCode, { }),
          Keyboard.sKeypress(eDoc, triggerCharCode, { })
        ]);
      };

      const sTestAutocompleteActivation = GeneralSteps.sequence([
        store.sClear,
        sSetContentAndTrigger('test=', '='.charCodeAt(0)),
        // Can't wait for anything to change, so just wait for a prefixed amount of time
        Step.wait(500),
        UiFinder.sNotExists(Body.body(), '.tox-autocompleter'),
        sSetContentAndTrigger('test=t', '='.charCodeAt(0)),
        tinyUi.sWaitForPopup('wait for autocompleter to appear', '.tox-autocompleter div[role="menu"]'),
        sAssertAutocompleterStructure({
          type: 'grid',
          groups: [
            [
              { title: 'two', icon: '=' },
              { title: 'three', icon: '=' }
            ]
          ]
        }),
        // Check the options shrink to 1 item
        sSetContentAndTrigger('test=tw', 'w'.charCodeAt(0)),
        Waiter.sTryUntil('Wait for autocompleter to update items', sAssertAutocompleterStructure({
          type: 'grid',
          groups: [
            [
              { title: 'two', icon: '=' }
            ]
          ]
        }), 100, 1000),
        // Check the autocompleter is hidden/closed when no items match
        sSetContentAndTrigger('test=twe', 'e'.charCodeAt(0)),
        sWaitForAutocompleteToClose,
        // Check the autocompleter is shown again when deleting a char
        sSetContentAndTrigger('test=tw', Keys.backspace()),
        tinyUi.sWaitForPopup('wait for autocompleter to appear', '.tox-autocompleter div[role="menu"]'),
        sAssertAutocompleterStructure({
          type: 'grid',
          groups: [
            [
              { title: 'two', icon: '=' }
            ]
          ]
        }),
        Keyboard.sKeydown(eDoc, Keys.enter(), { }),
        sWaitForAutocompleteToClose
      ]);

      Pipeline.async({ }, Logger.ts(
          'Trigger autocompleter',
          [
            tinyApis.sFocus,
            Logger.t('Checking first autocomplete (columns = 1) trigger: "+"', sTestFirstAutocomplete),
            Logger.t('Checking first autocomplete (columns = 1) trigger: "+"', sTestFirstAutocomplete2),
            Logger.t('Checking second autocomplete (columns = 2), two sources, trigger ":"', sTestSecondAutocomplete),
            Logger.t('Checking third autocomplete (columns = auto) trigger: "~"', sTestThirdAutocomplete),
            Logger.t('Checking forth autocomplete, (columns = 1), trigger: "!", no icons', sTestFourthAutocomplete),
            Logger.t('Checking fifth autocomplete, trigger: "=", custom activation check', sTestFifthAutocomplete),
            Logger.t('Checking sixth autocomplete, (columns = 1), trigger: "#", content has spaces', sTestSixthAutocomplete),
            Logger.t('Checking autocomplete activation based on content', sTestAutocompleteActivation),
            Logger.t('Checking autocomplete over fragmented text', sTestAutocompleteFragmentedText)
          ]
        ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addAutocompleter('Plus1', {
          ch: '+',
          minChars: 0,
          columns: 1,
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'aA', 'bB', 'cC', 'dD' ], (letter) => ({
                  value: `plus-${letter}`,
                  text: `p-${letter}`,
                  icon: '+'
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

        ed.ui.registry.addAutocompleter('Colon1', {
          ch: ':',
          minChars: 0,
          columns: 2,
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a' ], (letter) => ({
                  value: `colon1-${letter}`,
                  text: `c1-${letter}`,
                  icon: ':'
                }))
              );
            });
          },
          onAction: (autocompleteApi, rng, value) => {
            store.adder('colon1:' + value)();
            autocompleteApi.hide();
          }
        });

        ed.ui.registry.addAutocompleter('Colon2', {
          ch: ':',
          minChars: 0,
          columns: 2,
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a', 'b' ], (letter) => ({
                  value: `colon2-${letter}`,
                  text: `c2-${letter}`,
                  icon: ':'
                }))
              );
            });
          },
          onAction: (autocompleteApi, rng, value) => {
            store.adder('colon2:' + value)();
            autocompleteApi.hide();
          }
        });

        ed.ui.registry.addAutocompleter('Tilde', {
          ch: '~',
          minChars: 0,
          columns: 'auto',
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
                  value: `tilde-${letter}`,
                  text: `t-${letter}`,
                  icon: '~'
                }))
              );
            });
          },
          onAction: (autocompleteApi, rng, value) => {
            store.adder('tilde:' + value)();
            autocompleteApi.hide();
          }
        });

        ed.ui.registry.addAutocompleter('Exclamation', {
          ch: '!',
          minChars: 0,
          columns: 1,
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
                  value: `exclamation-${letter}`,
                  text: `exclamation-${letter}`
                }))
              );
            });
          },
          onAction: (autocompleteApi, rng, value) => {
            store.adder('exclamation:' + value)();
            autocompleteApi.hide();
          }
        });

        ed.ui.registry.addAutocompleter('Equals', {
          ch: '=',
          minChars: 1,
          columns: 'auto',
          matches: (rng, text, pattern) => {
            // Check the '=' is in the middle of a word
            return rng.startOffset !== 0 && !/\s/.test(text.charAt(rng.startOffset - 1));
          },
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              const filteredItems = Arr.filter([ 'two', 'three' ], (number) => number.indexOf(pattern) !== -1);
              resolve(
                Arr.map(filteredItems, (number) => ({
                  value: `${number}`,
                  text: `${number}`,
                  icon: '='
                }))
              );
            });
          },
          onAction: (autocompleteApi, rng, value) => {
            ed.selection.setRng(rng);
            ed.insertContent('=' + value);
            autocompleteApi.hide();
          }
        });

        ed.ui.registry.addAutocompleter('Asterisk', {
          ch: '*',
          minChars: 2,
          columns: 'auto',
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
                  value: `asterisk-${letter}`,
                  text: `asterisk-${letter}`,
                  icon: '*'
                }))
              );
            });
          },
          onAction: (autocompleteApi, rng, value) => {
            store.adder('asterisk:' + value)();
            ed.selection.setRng(rng);
            ed.insertContent(value);
            autocompleteApi.hide();
          }
        });

        ed.ui.registry.addAutocompleter('Hash with spaces', {
          ch: '#',
          minChars: 1,
          columns: 1,
          fetch: (pattern, maxResults) => {
            const filteredItems = Arr.filter([
              { text: 'dollar sign', value: '$' },
              { text: 'equals sign', value: '=' },
              { text: 'some name', value: '`'}
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
      }
    },
    () => {
      success();
    },
    failure
  );
});