import { Logger, Pipeline, Step, Keys, UiFinder, GeneralSteps, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import { TinyLoader, TinyUi, TinyApis, TinyActions } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { AutocompleterStructure, sAssertAutocompleterStructure, sWaitForAutocompleteToClose, sWaitForAutocompleteToOpen } from '../../../module/AutocompleterUtils';

UnitTest.asynctest('Editor Autocompleter test', (success, failure) => {
  SilverTheme();

  const store = TestHelpers.TestStore();

  interface TriggerDetails {
    triggerChar: string;
    initialContent?: string;
    additionalContent?: string;
    cursorPos?: {
      elementPath: number[];
      offset: number;
    };
  }

  interface Scenario extends TriggerDetails {
    structure: AutocompleterStructure;
    choice: Step<any, any>;
    assertion: Step<any, any>;
  }

  TinyLoader.setupLight(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);
      const tinyActions = TinyActions(editor);

      const sSetContentAndTrigger = (details: TriggerDetails, triggerOverride?: number) => {
        const initialContent = details.initialContent || details.triggerChar;
        const additionalContent = details.additionalContent;
        return GeneralSteps.sequence([
          tinyApis.sSetContent(`<p>${initialContent}</p>`),
          details.cursorPos ? tinyApis.sSetCursor(details.cursorPos.elementPath, details.cursorPos.offset) : tinyApis.sSetCursor([ 0, 0 ], initialContent.length),
          tinyActions.sContentKeypress(triggerOverride || details.triggerChar.charCodeAt(0), { }),
          // Wait 50ms for the keypress to process
          Step.wait(50),
          ...additionalContent ? [
            tinyApis.sExecCommand('mceInsertContent', additionalContent),
            tinyActions.sContentKeypress(additionalContent.charCodeAt(additionalContent.length - 1), { }),
          ] : [ ]
        ]);
      };

      const sTestAutocompleter = (scenario: Scenario) => {
        return GeneralSteps.sequence([
          store.sClear,
          sSetContentAndTrigger(scenario),
          sWaitForAutocompleteToOpen,
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
          tinyActions.sContentKeydown(Keys.down(), { }),
          tinyActions.sContentKeydown(Keys.enter(), { })
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
          tinyActions.sContentKeydown(Keys.down(), { }),
          tinyActions.sContentKeydown(Keys.enter(), { })
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
          tinyActions.sContentKeydown(Keys.down(), { }),
          tinyActions.sContentKeydown(Keys.enter(), { }),
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
          tinyActions.sContentKeydown(Keys.right(), { }),
          tinyActions.sContentKeydown(Keys.right(), { }),
          tinyActions.sContentKeydown(Keys.enter(), { })
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
          tinyActions.sContentKeydown(Keys.down(), { }),
          tinyActions.sContentKeydown(Keys.down(), { }),
          tinyActions.sContentKeydown(Keys.enter(), { })
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
          tinyActions.sContentKeydown(Keys.enter(), { })
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
          tinyActions.sContentKeydown(Keys.enter(), { })
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
          tinyActions.sContentKeydown(Keys.enter(), { })
        ]),
        assertion: tinyApis.sAssertContent('<p>asterisk-a</p>')
      });

      const sTestAutocompleteStartOfWord = GeneralSteps.sequence([
        store.sClear,
        sSetContentAndTrigger({
          triggerChar: '*',
          initialContent: 'a*',
          additionalContent: 'bc'
        }),
        // Can't wait for anything to change, so just wait for a prefixed amount of time
        Step.wait(500),
        Step.label('Check the autocompleter does not appear', UiFinder.sNotExists(Body.body(), '.tox-autocompleter')),
        sSetContentAndTrigger({
          triggerChar: '*',
          additionalContent: 'bc'
        }),
        tinyUi.sWaitForPopup('wait for autocompleter to appear', '.tox-autocompleter div[role="menu"]'),
        sAssertAutocompleterStructure({
          type: 'grid',
          groups: [
            [
              { title: 'asterisk-a', icon: '*' },
              { title: 'asterisk-b', icon: '*' },
              { title: 'asterisk-c', icon: '*' },
              { title: 'asterisk-d', icon: '*' }
            ]
          ]
        }),
        tinyActions.sContentKeydown(Keys.enter(), { }),
        sWaitForAutocompleteToClose
      ]);

      const sTestAutocompleteActivation = GeneralSteps.sequence([
        store.sClear,
        sSetContentAndTrigger({
          triggerChar: '=',
          initialContent: 'test='
        }),
        // Can't wait for anything to change, so just wait for a prefixed amount of time
        Step.wait(500),
        Step.label('Check the autocompleter does not appear', UiFinder.sNotExists(Body.body(), '.tox-autocompleter')),
        sSetContentAndTrigger({
          triggerChar: '=',
          initialContent: 'test=t'
        }),
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
        tinyApis.sAssertContent('<p>test=t</p>'),
        // Check the options shrink to 1 item
        sSetContentAndTrigger({
          triggerChar: '=',
          initialContent: 'test=tw'
        }, 'w'.charCodeAt(0)),
        Waiter.sTryUntil('Wait for autocompleter to update items', sAssertAutocompleterStructure({
          type: 'grid',
          groups: [
            [
              { title: 'two', icon: '=' }
            ]
          ]
        }), 100, 1000),
        tinyApis.sAssertContent('<p>test=tw</p>'),
        // Check the autocompleter is hidden/closed when no items match
        sSetContentAndTrigger({
          triggerChar: '=',
          initialContent: 'test=twe'
        }, 'e'.charCodeAt(0)),
        sWaitForAutocompleteToClose,
        tinyApis.sAssertContent('<p>test=twe</p>'),
        // Check the autocompleter is shown again when deleting a char
        sSetContentAndTrigger({
          triggerChar: '=',
          initialContent: 'test=tw'
        }, Keys.backspace()),
        tinyUi.sWaitForPopup('wait for autocompleter to appear', '.tox-autocompleter div[role="menu"]'),
        sAssertAutocompleterStructure({
          type: 'grid',
          groups: [
            [
              { title: 'two', icon: '=' }
            ]
          ]
        }),
        tinyActions.sContentKeydown(Keys.enter(), { }),
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
            Logger.t('Checking autocomplete start of word detection', sTestAutocompleteStartOfWord),
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
