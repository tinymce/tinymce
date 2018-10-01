import '../../../../../silver/main/ts/Theme';

import { FocusTools, Keyboard, Keys, Pipeline, Step, UiFinder, Log, Chain, Assertions, ApproxStructure, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, Body } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';

import { TestStore } from '../../module/AlloyTestUtils';

UnitTest.asynctest('Editor ContextForm test', (success, failure) => {
  const store = TestStore();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      const doc = Element.fromDom(document);

      const sOpen = (toolbarKey: string) => Step.sync(() => {
        editor.fire('contexttoolbar-show', {
          toolbarKey
        });
      });

      const sCheckLastButtonGroup = (label: string, children: (s, str, arr) => any) => {
        return Chain.asStep(Body.body(), [
          UiFinder.cFindIn('.tox-pop .tox-toolbar__group:last'),
          Assertions.cAssertStructure(label, ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              children: children(s, str, arr)
            });
          }))
        ]);
      };

      const sFire = (event: string, object) => Step.sync(() => {
        editor.fire(event, object);
      });

      const sHasDialog = (label: string) => Chain.asStep(Body.body(), [
        UiFinder.cFindIn('.tox-pop'),
        Assertions.cAssertStructure(
          `${label}: Checking pop has a dialog`,
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-pop') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-pop__dialog') ]
                })
              ]
            });
          })
        )
      ]);

      const sClickAway = Step.sync(() => {
        // <a> tags make the context bar appear so click away from an a tag. We have no content so it's probably fine.
        editor.nodeChanged();
      });

      const sCheckNoPopDialog = Waiter.sTryUntil(
        'Pop dialog should disappear (soon)',
        UiFinder.sNotExists(Body.body(), '.tox-pop'),
        100,
        1000
      );

      Pipeline.async({ }, [
        Log.stepsAsStep('TBA', 'Immediately launching a context form, and navigating and triggering enter and esc', [
          tinyApis.sFocus,
          sOpen('test-form'),
          FocusTools.sTryOnSelector('Focus should now be on input in context form', doc, 'input'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),
          FocusTools.sTryOnSelector('Focus should now be on button in context form', doc, 'button:contains("A")'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),
          FocusTools.sTryOnSelector('Focus should go back to input in context form', doc, 'input'),
          FocusTools.sSetActiveValue(doc, 'Words'),
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          store.sAssertEq('B should have fired because it is primary', [ 'B.Words' ]),
          sHasDialog('Immediate context form should have an inner dialog class'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          UiFinder.sExists(Body.body(), '.tox-pop'),
          tinyApis.sTryAssertFocus,
          sClickAway,
          sCheckNoPopDialog
        ]),

        Log.stepsAsStep('TBA', 'Launch a context form from a context toolbar', [
          sOpen('test-toolbar'),
          FocusTools.sTryOnSelector('Focus should now be on button in context toolbar', doc, '.tox-pop button'),
          sHasDialog('Iniital context toolbar should have an inner dialog class'),
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          FocusTools.sTryOnSelector('Focus should now be on input in context form that was launched by button', doc, 'input'),
          sHasDialog('Launched context form should have an inner dialog class'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          FocusTools.sTryOnSelector('Focus should have shifted back to the triggering toolbar', doc, '.tox-pop button'),
          sHasDialog('Restored context toolbar (esc from form) should have an inner dialog class'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          UiFinder.sExists(Body.body(), '.tox-pop'),
          tinyApis.sTryAssertFocus,
          sClickAway,
          sCheckNoPopDialog
        ]),

        Log.stepsAsStep('TBA', 'Launching context form does not work if the context toolbar launcher is disabled', [
          sOpen('test-toolbar'),
          sFire('test.updateButtonABC', { disable: true }),
          sCheckLastButtonGroup('Checking button is disabled after event', (s, str, arr) => [
            s.element('button', {
              attrs: {
                disabled: str.is('disabled')
              }
            })
          ]),
          sFire('test.updateButtonABC', { disable: false }),
          sCheckLastButtonGroup('Checking button is re-enabled after event', (s, str, arr) => [
            s.element('button', {
              attrs: {
                disabled: str.none()
              }
            })
          ]),

          sFire('test.updateButtonABC', { active: true }),
          sCheckLastButtonGroup('Checking button is pressed after event', (s, str, arr) => [
            s.element('button', {
              attrs: {
                'aria-pressed': str.is('true')
              }
            })
          ]),

          sFire('test.updateButtonABC', { active: false }),
          sCheckLastButtonGroup('Checking button is *not* pressed after event', (s, str, arr) => [
            s.element('button', {
              attrs: {
                'aria-pressed': str.is('false')
              }
            })
          ])
        ]),

        Log.stepsAsStep('TBA', 'Checking that context form buttons have a working disabled/active api', [
          sOpen('test-form'),
          sFire('test.updateButtonA', { disable: true }),
          sFire('test.updateButtonC', { active: true }),
          sCheckLastButtonGroup('Checking buttons have right state', (s, str, arr) => [
            s.element('button', { attrs: { disabled: str.is('disabled') } }),
            s.element('button', { attrs: { disabled: str.none() } }),
            s.element('button', { attrs: { 'aria-pressed': str.is('true') } })
          ])
        ])
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      skin_url: '/project/js/tinymce/skins/oxide',
      setup: (ed: Editor) => {
        ed.ui.registry.addContextForm('test-form', {
          launch: {
            type: 'contextformtogglebutton',
            icon: 'ABC',
            onSetup: (buttonApi) => {
              const f = (evt) => {
                if (evt.hasOwnProperty('disable')) {
                  buttonApi.setDisabled(evt.disable);
                } else if (evt.hasOwnProperty('active')) {
                  buttonApi.setActive(evt.active);
                }
              };

              ed.on('test.updateButtonABC', f);

              return () => {
                ed.off('test.updateButtonABC', f);
              };
            }
          },

          predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'a',
          commands: [
            {
              type: 'contextformbutton',
              icon: 'A',
              onSetup: (buttonApi) => {
                const f = (evt) => {
                  if (evt.hasOwnProperty('disable')) {
                    buttonApi.setDisabled(evt.disable);
                  }
                };

                ed.on('test.updateButtonA', f);

                return () => {
                  ed.off('test.updateButtonA', f);
                };
              },
              onAction: (formApi, buttonApi) => store.adder('A.' + formApi.getValue())()
            },
            {
              type: 'contextformbutton',
              icon: 'B',
              primary: true,
              onAction: (formApi, buttonApi) => store.adder('B.' + formApi.getValue())()
            },
            {
              type: 'contextformtogglebutton',
              icon: 'C',
              onSetup: (buttonApi) => {
                const f = (evt) => {
                  if (evt.hasOwnProperty('disable')) {
                    buttonApi.setDisabled(evt.disable);
                  } else if (evt.hasOwnProperty('active')) {
                    buttonApi.setActive(evt.active);
                  }
                };

                ed.on('test.updateButtonC', f);

                return () => {
                  ed.off('test.updateButtonC', f);
                };
              },
              onAction: (formApi, buttonApi) => store.adder('C.' + formApi.getValue())()
            }
          ]
        });

        ed.ui.registry.addContextToolbar('test-toolbar', {
          predicate: () => false,
          items: [ 'form:test-form' ]
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});