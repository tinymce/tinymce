import { ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Body, Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Editor ContextForm test', (success, failure) => {
  SilverTheme();

  const platform = PlatformDetection.detect();
  const isIE = platform.browser.isIE();
  const skipInIE = <T, U> (step: Step<T, U>) => isIE ? Step.pass : step;
  const store = TestHelpers.TestStore();

  TinyLoader.setupLight(
    (editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      const doc = Element.fromDom(document);

      const sOpen = (toolbarKey: string) => Step.sync(() => {
        editor.fire('contexttoolbar-show', {
          toolbarKey
        });
      });

      const sCheckLastButtonGroup = (label: string, children: (s, str, arr) => any) => Chain.asStep(Body.body(), [
        UiFinder.cFindIn('.tox-pop .tox-toolbar__group:last'),
        Assertions.cAssertStructure(label, ApproxStructure.build((s, str, arr) => s.element('div', {
          children: children(s, str, arr)
        })))
      ]);

      const sFire = (event: string, object) => Step.sync(() => {
        editor.fire(event, object);
      });

      const sHasDialog = (label: string) => Chain.asStep(Body.body(), [
        UiFinder.cFindIn('.tox-pop'),
        Assertions.cAssertStructure(
          `${label}: Checking pop has a dialog`,
          ApproxStructure.build((s, _str, arr) => s.element('div', {
            classes: [ arr.has('tox-pop') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-pop__dialog') ]
              })
            ]
          }))
        )
      ]);

      const sClickAway = Step.sync(() => {
        // <a> tags make the context bar appear so click away from an a tag. We have no content so it's probably fine.
        editor.nodeChanged();
      });

      const sCheckNoPopDialog = Waiter.sTryUntil(
        'Pop dialog should disappear (soon)',
        UiFinder.sNotExists(Body.body(), '.tox-pop')
      );

      Pipeline.async({ }, [
        Step.label('Focus editor', tinyApis.sFocus()),

        Log.step('TBA', 'Immediately launching a context form, and navigating and triggering enter and esc', GeneralSteps.sequence([
          Step.label('Open context form', sOpen('test-form')),
          Step.label('Check focus is on the input', FocusTools.sTryOnSelector('Focus should now be on input in context form', doc, 'input')),
          Step.label('Press tab', Keyboard.sKeydown(doc, Keys.tab(), { })),
          Step.label('Check focus is on the button "A"', FocusTools.sTryOnSelector('Focus should now be on button in context form', doc, 'button[aria-label="A"]')),
          Step.label('Press tab (again)', Keyboard.sKeydown(doc, Keys.tab(), { })),
          Step.label('Check focus returned to the input', FocusTools.sTryOnSelector('Focus should go back to input in context form', doc, 'input')),
          Step.label('Set the active focus (input) value to "Words"', FocusTools.sSetActiveValue(doc, 'Words')),
          Step.label('Press enter', Keyboard.sKeydown(doc, Keys.enter(), { })),
          Step.label('Check the action of button "B" fired', store.sAssertEq('B should have fired because it is primary', [ 'B.Words' ])),
          Step.label('Check that a dialog is displayed', sHasDialog('Immediate context form should have an inner dialog class')),
          Step.label('Press escape', Keyboard.sKeydown(doc, Keys.escape(), { })),
          Step.label('Check that the context popup still exists', UiFinder.sExists(Body.body(), '.tox-pop')),
          Step.label('Check that the editor still has focus', tinyApis.sTryAssertFocus()),
          Step.label('Simulate clicking elsewhere in the editor (fire node change)', sClickAway),
          Step.label('Check that the popup dialog closes', sCheckNoPopDialog)
        ])),

        // TODO FIXME DISABLED-TEST TINY-2724
        // Disable reason: Focus does not return to the context toolbar after its context form is closed (by escape)
        skipInIE(Log.step('TBA', 'Launch a context form from a context toolbar', GeneralSteps.sequence([
          Step.label('Open a context toolbar', sOpen('test-toolbar')),
          Step.label('Check focus is on the button in context toolbar', FocusTools.sTryOnSelector('Focus should now be on button in context toolbar', doc, '.tox-pop button')),
          Step.label('Check for inner dialog class on context toolbar', sHasDialog('Iniital context toolbar should have an inner dialog class')),
          Step.label('Press enter', Keyboard.sKeydown(doc, Keys.enter(), { })),
          Step.label('Check focus is on input in context form', FocusTools.sTryOnSelector('Focus should now be on input in context form that was launched by button', doc, 'input')),
          Step.label('Check for inner dialog class on context form', sHasDialog('Launched context form should have an inner dialog class')),
          Step.label('Press escape', Keyboard.sKeydown(doc, Keys.escape(), { })),
          // IE fails here
          Step.label('Check focus returns to context toolbar', FocusTools.sTryOnSelector('Focus should have shifted back to the triggering toolbar', doc, '.tox-pop button')),
          Step.label('Check context toolbar has inner dialog class', sHasDialog('Restored context toolbar (esc from form) should have an inner dialog class')),
          Step.label('Press escape (again)', Keyboard.sKeydown(doc, Keys.escape(), { })),
          Step.label('Check that the context popup still exists', UiFinder.sExists(Body.body(), '.tox-pop')),
          Step.label('Check that the editor still has focus', tinyApis.sTryAssertFocus()),
          Step.label('Simulate clicking elsewhere in the editor (fire node change)', sClickAway),
          Step.label('Check that the popup dialog closes', sCheckNoPopDialog)
        ]))),

        Log.stepsAsStep('TBA', 'Launching context form does not work if the context toolbar launcher is disabled', [
          sOpen('test-toolbar'),
          sFire('test.updateButtonABC', { disable: true }),
          sCheckLastButtonGroup('Checking button is disabled after event', (s, str, arr) => [
            s.element('button', {
              classes: [ arr.has('tox-tbtn--disabled') ],
              attrs: { 'aria-disabled': str.is('true') }
            })
          ]),
          sFire('test.updateButtonABC', { disable: false }),
          sCheckLastButtonGroup('Checking button is re-enabled after event', (s, _str, arr) => [
            s.element('button', {
              classes: [ arr.not('tox-tbtn--disabled') ]
            })
          ]),

          sFire('test.updateButtonABC', { active: true }),
          sCheckLastButtonGroup('Checking button is pressed after event', (s, str, _arr) => [
            s.element('button', {
              attrs: {
                'aria-pressed': str.is('true')
              }
            })
          ]),

          sFire('test.updateButtonABC', { active: false }),
          sCheckLastButtonGroup('Checking button is *not* pressed after event', (s, str, _arr) => [
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
            s.element('button', { classes: [ arr.has('tox-tbtn--disabled') ], attrs: { 'aria-disabled': str.is('true') }}),
            s.element('button', { classes: [ arr.not('tox-tbtn--disabled') ] }),
            s.element('button', { attrs: { 'aria-pressed': str.is('true') }})
          ])
        ])
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addContextForm('test-form', {
          launch: {
            type: 'contextformtogglebutton',
            icon: 'fake-icon-name',
            tooltip: 'ABC',
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
              icon: 'fake-icon-name',
              tooltip: 'A',
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
              onAction: (formApi, _buttonApi) => store.adder('A.' + formApi.getValue())()
            },
            {
              type: 'contextformbutton',
              icon: 'fake-icon-name',
              tooltip: 'B',
              primary: true,
              onAction: (formApi, _buttonApi) => store.adder('B.' + formApi.getValue())()
            },
            {
              type: 'contextformtogglebutton',
              icon: 'fake-icon-name',
              tooltip: 'C',
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
              onAction: (formApi, _buttonApi) => store.adder('C.' + formApi.getValue())()
            }
          ]
        });

        ed.ui.registry.addContextToolbar('test-toolbar', {
          predicate: () => false,
          items: 'form:test-form'
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});
