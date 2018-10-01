import '../../../../../silver/main/ts/Theme';

import { Logger, Pipeline, Keyboard, Step, Keys, Chain, UiFinder, ApproxStructure, Assertions, GeneralSteps, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi, TinyApis } from '@ephox/mcagar';
import { Editor } from 'tinymce/core/api/Editor';
import { Element, Body } from '@ephox/sugar';
import { TestStore } from '../../module/AlloyTestUtils';
import { Arr } from '@ephox/katamari';
import { StructAssert } from '@ephox/agar/lib/main/ts/ephox/agar/assertions/ApproxStructures';
import Promise from 'tinymce/core/api/util/Promise';

UnitTest.asynctest('Editor Autocompleter test', (success, failure) => {
  const store = TestStore();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);

      const eDoc = Element.fromDom(editor.getDoc());

      const structWithIconAndText = (d) => (s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-collection__item') ],
          children: [
            s.element('span', {
              classes: [ arr.has('tox-collection__item-icon') ],
              html: str.is(d.icon)
            }),
            s.element('span', {
              classes: [ arr.has('tox-collection__item-label') ],
              html: str.is(d.text)
            })
          ]
        });
      };

      const structWithIcon = (d) => (s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-collection__item') ],
          children: [
            s.element('span', {
              classes: [ arr.has('tox-collection__item-icon') ],
              html: str.is(d.icon)
            })
          ]
        });
      };

      const sTestAutocompleter = (scenario: { triggerChar: string, structure: (s, str, arr) => StructAssert, choice: Step<any, any>, assertion: Step<any, any> }) => {
        return GeneralSteps.sequence([
          store.sClear,
          tinyApis.sSetContent(`<p>${scenario.triggerChar}</p>`),
          tinyApis.sSetCursor([ 0, 0 ], scenario.triggerChar.length),
          Keyboard.sKeypress(eDoc, scenario.triggerChar.charCodeAt(0), { }),
          tinyUi.sWaitForPopup('wait for autocompleter to appear', '.tox-autocompleter div[role="menu"]'),
          Chain.asStep(Body.body(), [
            UiFinder.cFindIn('.tox-autocompleter'),
            Assertions.cAssertStructure(
              'Checking the autocompleter',
              ApproxStructure.build((s, str, arr) => {
                return s.element('div', {
                  classes: [ arr.has('tox-autocompleter') ],
                  children: [
                    scenario.structure(s, str, arr)
                  ]
                });
              })
            )
          ]),
          scenario.choice,
          Waiter.sTryUntil(
            'Autocompleter should disappear',
            UiFinder.sNotExists(Body.body(), '.tox-autocompleter'),
            100,
            1000
          ),
          scenario.assertion
        ]);
      };

      const sTestFirstAutocomplete = sTestAutocompleter({
        triggerChar: '+',
        structure: (s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-menu'), arr.has('tox-collection--list'), arr.has('tox-collection') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-collection__group') ],
              children: Arr.map([
                { icon: 'plus-a', text: 'p-a' },
                { icon: 'plus-b', text: 'p-b' },
                { icon: 'plus-c', text: 'p-c' },
                { icon: 'plus-d', text: 'p-d' }
              ], (d) => structWithIconAndText(d)(s, str, arr))
            })
          ]
        }),
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.down(), { }),
         Keyboard.sKeydown(eDoc, Keys.enter(), { }),
        ]),
        assertion: tinyApis.sAssertContent('<p>plus-b</p>')
      });

      const sTestSecondAutocomplete = sTestAutocompleter({
        triggerChar: ':',
        structure: (s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('tox-menu'), arr.has('tox-collection--grid'), arr.has('tox-collection') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: Arr.map([
                  { icon: 'colon1-a', text: 'c1-a' },
                  { icon: 'colon2-a', text: 'c2-a' }
                ], (d) => {
                  return structWithIcon(d)(s, str, arr);
                })
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: Arr.map([
                  { icon: 'colon2-b', text: 'c2-b' }
                ], (d) => {
                  return structWithIcon(d)(s, str, arr);
                })
              })
            ]
          });
        },
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.down(), { }),
          Keyboard.sKeydown(eDoc, Keys.enter(), { }),
        ]),
        assertion: store.sAssertEq('Second action should fire', [ 'colon2:colon2-b' ])
      });

      const sTestThirdAutocomplete = sTestAutocompleter({
        triggerChar: '~',
        structure: (s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('tox-menu'), arr.has('tox-collection--grid'), arr.has('tox-collection') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: Arr.map([
                  { icon: 'tilde-a' },
                  { icon: 'tilde-b' },
                  { icon: 'tilde-c' },
                  { icon: 'tilde-d' }
                ], (d) => {
                  return structWithIcon(d)(s, str, arr);
                })
              })
            ]
          });
        },
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.right(), { }),
          Keyboard.sKeydown(eDoc, Keys.right(), { }),
          Keyboard.sKeydown(eDoc, Keys.enter(), { }),
        ]),
        assertion: store.sAssertEq('Tilde-c should fire', [ 'tilde:tilde-c' ])
      });

      Pipeline.async({ }, Logger.ts(
          'Trigger autocompleter',
          [
            tinyApis.sFocus,
            Logger.t('Checking first autocomplete (columns = 1) trigger: "+"', sTestFirstAutocomplete),
            Logger.t('Checking second autocomplete (columns = 2), two sources, trigger ":"', sTestSecondAutocomplete),
            Logger.t('Checking third autocomplete (columns = auto) trigger: "~"', sTestThirdAutocomplete)
          ]
        ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      skin_url: '/project/js/tinymce/skins/oxide',
      setup: (ed: Editor) => {
        ed.ui.registry.addAutocompleter('Plus1', {
          ch: '+',
          columns: 1,
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
                  value: `plus-${letter}`,
                  text: `p-${letter}`,
                  icon: `plus-${letter}`
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
          columns: 2,
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a' ], (letter) => ({
                  value: `colon1-${letter}`,
                  text: `c1-${letter}`,
                  icon: `colon1-${letter}`
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
          columns: 2,
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a', 'b' ], (letter) => ({
                  value: `colon2-${letter}`,
                  text: `c2-${letter}`,
                  icon: `colon2-${letter}`
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
          columns: 'auto',
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              resolve(
                Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
                  value: `tilde-${letter}`,
                  text: `t-${letter}`,
                  icon: `tilde-${letter}`
                }))
              );
            });
          },
          onAction: (autocompleteApi, rng, value) => {
            store.adder('tilde:' + value)();
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