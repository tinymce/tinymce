import 'tinymce/themes/silver/Theme';

import { Logger, Pipeline, Keyboard, Step, Keys, Chain, UiFinder, ApproxStructure, Assertions, GeneralSteps, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi, TinyApis } from '@ephox/mcagar';
import { Editor } from 'tinymce/core/api/Editor';
import { Element, Body } from '@ephox/sugar';
import { Arr } from '@ephox/katamari';
import Promise from 'tinymce/core/api/util/Promise';
import { TestHelpers } from '@ephox/alloy';

UnitTest.asynctest('Editor Autocompleter test', (success, failure) => {
  const store = TestHelpers.TestStore();

  interface AutocompleterListStructure {
    type: 'list';
    hasIcons: boolean;
    groups: { title: string; text: string; icon?: string }[][];
  }

  interface AutocompleterGridStructure {
    type: 'grid';
    groups: { title: string; icon?: string }[][];
  }

  type AutocompleterStructure = AutocompleterListStructure | AutocompleterGridStructure;

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);

      const eDoc = Element.fromDom(editor.getDoc());

      const structWithTitleAndIconAndText = (d) => (s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-collection__item') ],
          attrs: {
            title: str.is(d.title)
          },
          children: [
            s.element('span', {
              classes: [ arr.has('tox-collection__item-icon') ],
              children: [
                s.text(str.is(d.icon))
              ]
            }),
            s.element('span', {
              classes: [ arr.has('tox-collection__item-label') ],
              html: str.is(d.text)
            })
          ]
        });
      };

      const structWithTitleAndText = (d) => (s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-collection__item') ],
          attrs: {
            title: str.is(d.title)
          },
          children: [
            s.element('span', {
              classes: [ arr.has('tox-collection__item-label') ],
              html: str.is(d.text)
            })
          ]
        });
      };

      const structWithTitleAndIcon = (d) => (s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-collection__item') ],
          attrs: {
            title: str.is(d.title)
          },
          children: [
            s.element('span', {
              classes: [ arr.has('tox-collection__item-icon') ],
              children: [
                s.text(str.is(d.icon))
              ]
            })
          ]
        });
      };

      const sWaitForAutocompleteToClose = Waiter.sTryUntil(
        'Autocompleter should disappear',
        UiFinder.sNotExists(Body.body(), '.tox-autocompleter'),
        100,
        1000
      );

      const sAssertAutocompleterStructure = (structure: AutocompleterStructure) => {
        return Chain.asStep(Body.body(), [
          UiFinder.cFindIn('.tox-autocompleter'),
          Assertions.cAssertStructure(
            'Checking the autocompleter',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                classes: [ arr.has('tox-autocompleter') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-menu'), arr.has(`tox-collection--${structure.type}`), arr.has('tox-collection') ],
                    children: Arr.map(structure.groups, (group) => {
                      return s.element('div', {
                        classes: [ arr.has('tox-collection__group') ],
                        children: Arr.map(group, (d) => {
                          if (structure.type === 'list') {
                            if (structure.hasIcons) {
                              return structWithTitleAndIconAndText(d)(s, str, arr);
                            } else {
                              return structWithTitleAndText(d)(s, str, arr);
                            }
                          } else {
                            return structWithTitleAndIcon(d)(s, str, arr);
                          }
                        })
                      });
                    })
                  })
                ]
              });
            })
          )
        ]);
      };

      const sTestAutocompleter = (scenario: { triggerChar: string, structure: AutocompleterStructure, choice: Step<any, any>, assertion: Step<any, any>, content?: string }) => {
        const content = scenario.content || scenario.triggerChar;
        return GeneralSteps.sequence([
          store.sClear,
          tinyApis.sSetContent(`<p>${content}</p>`),
          tinyApis.sSetCursor([ 0, 0 ], content.length),
          Keyboard.sKeypress(eDoc, scenario.triggerChar.charCodeAt(0), { }),
          tinyUi.sWaitForPopup('wait for autocompleter to appear', '.tox-autocompleter div[role="menu"]'),
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
              { title: 'p-a', text: 'p-a', icon: '+' },
              { title: 'p-b', text: 'p-b', icon: '+' },
              { title: 'p-c', text: 'p-c', icon: '+' },
              { title: 'p-d', text: 'p-d', icon: '+' }
            ]
          ]
        },
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.down(), { }),
          Keyboard.sKeydown(eDoc, Keys.enter(), { })
        ]),
        assertion: tinyApis.sAssertContent('<p>plus-b</p>')
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
        content: 'test=t',
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
            Logger.t('Checking second autocomplete (columns = 2), two sources, trigger ":"', sTestSecondAutocomplete),
            Logger.t('Checking third autocomplete (columns = auto) trigger: "~"', sTestThirdAutocomplete),
            Logger.t('Checking forth autocomplete, (columns = 1), trigger: "!", no icons', sTestFourthAutocomplete),
            Logger.t('Checking fifth autocomplete, trigger: "=", custom activation check', sTestFifthAutocomplete),
            Logger.t('Checking autocomplete activation based on content', sTestAutocompleteActivation)
          ]
        ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      base_url: '/project/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addAutocompleter('Plus1', {
          ch: '+',
          minChars: 0,
          columns: 1,
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
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
      }
    },
    () => {
      success();
    },
    failure
  );
});