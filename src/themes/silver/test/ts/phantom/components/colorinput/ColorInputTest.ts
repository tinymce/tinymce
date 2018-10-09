import { ApproxStructure, Assertions, FocusTools, GeneralSteps, Logger, Mouse, Step, UiFinder, Waiter, Keys, Keyboard, Log, Chain } from '@ephox/agar';
import {
  AlloyTriggers,
  Behaviour,
  Container,
  GuiFactory,
  Invalidating,
  Memento,
  NativeEvents,
  Positioning,
  Representing,
} from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option, Result } from '@ephox/katamari';
import { SelectorFind, Traverse } from '@ephox/sugar';

import { renderColorInput } from '../../../../../main/ts/ui/dialog/ColorInput';
import { GuiSetup } from '../../../module/AlloyTestUtils';

// TODO: Expose properly through alloy.
UnitTest.asynctest('Color input component Test', (success, failure) => {
  const memSink = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'test-sink' ]
    },
    behaviours: Behaviour.derive([
      Positioning.config({ })
    ])
  });

  GuiSetup.setup(
    (store, doc, body) => {
      const me = GuiFactory.build(
        Container.sketch({
          dom: {
            classes: [ 'colorinput-container' ]
          },
          components: [
            memSink.asSpec(),
            renderColorInput({
              type: 'colorinput',
              name: 'alpha',
              label: Option.some('test-color-input'),
              colspan: Option.none()
             }, {
               interpreter: (x) => x,
               getSink: () => {
                 return memSink.getOpt(me).fold(
                   () => Result.error('Could not find the sink!'),
                   Result.value
                 );
               },
               providers: {
                icons: () => <Record<string, string>> {}
              }
             }, {
               colorPicker: (callback, value) => {}
             })
          ]
        })
      );

      return me;
    },
    (doc, body, gui, component, store) => {
      const input = component.getSystem().getByDom(
        SelectorFind.descendant(component.element(), 'input').getOrDie('Could not find input in colorinput')
      ).getOrDie();

      const legend = component.getSystem().getByDom(
        // Intentionally, only finding direct child
        SelectorFind.descendant(component.element(), 'span').getOrDie('Could not find legend in colorinput')
      ).getOrDie();

      const sSetColorInputValue = (newValue: string) => Step.sync(() => {
        // Once we put more identifying marks on a colorinput, use that instead.
        const colorinput = component.components()[1];
        Representing.setValue(colorinput, newValue);
      });

      const sOpenPicker = Logger.t(
        'Clicking the legend should bring up the colorpicker',
        GeneralSteps.sequence([
          Mouse.sClickOn(legend.element(), 'root:span'),
          UiFinder.sWaitFor('Waiting for colorpicker to show up!', component.element(), '.tox-color-picker-container')
        ])
      );

      const sAssertFocusedValue = (label: string, expected: string) => Logger.t(label, Chain.asStep(component.element(), [
        FocusTools.cGetActiveValue,
        Assertions.cAssertEq('Checking value of focused element', expected)
      ]));

      const sAssertLegendBackground = (label: string, f) => Assertions.sAssertStructure(
        label + ': Checking background of legend button',
        ApproxStructure.build((s, str, arr) => {
          return s.element('span', {
            styles: {
              'background-color': f(s, str, arr)
            }
          });
        }),
        legend.element()
      );

      const sAssertContainerClasses = (label: string, f) => {
        return Waiter.sTryUntil(
          label + ': Checking classes on container',
          Assertions.sAssertStructure(
            'Checking classes only',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                classes: f(s, str, arr)
                // ignore children
              });
            }),
            Traverse.parent(input.element()).getOrDie('Could not find parent of input')
          ),
          100,
          1000
        );
      };

      return [
        GuiSetup.mAddStyles(doc, [
          '.tox-textbox-field-invalid input { outline: 2px solid red; }'
        ]),
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              children: [
                s.element('div', {
                  classes: [ arr.has('test-sink') ]
                }),
                s.element('div', {
                  children: [
                    // Ignore other information because it is subject to change. No oxide example yet.
                    s.element('label', { }),
                    s.element('div', {
                      children: [
                        s.element('input', { }),
                        s.element('span', { })
                      ]
                    })
                  ]
                })
              ]
            });
          }),
          component.element()
        ),

        Logger.t(
          'Initially, the colour should not be invalid',
          GeneralSteps.sequence([
            Assertions.sAssertEq('Invalidating.isInvalid', false, Invalidating.isInvalid(input))
          ])
        ),

        Logger.t(
          'Type an invalid colour: "notblue"',
          GeneralSteps.sequence([
            FocusTools.sSetFocus('Move focus to input field', component.element(), 'input'),
            FocusTools.sSetActiveValue(doc, 'notblue'),
            Step.sync(() => {
              AlloyTriggers.emit(input, NativeEvents.input());
            }),

            sAssertContainerClasses('Post: typing invalid colour (notblue)', (s, str, arr) => [ arr.has('tox-textbox-field-invalid') ]),
            sAssertLegendBackground('After typing invalid colour (notblue)', (s, str, arr) => str.none())
          ])
        ),

        Logger.t(
          'Type a valid colour',
          GeneralSteps.sequence([
            FocusTools.sSetActiveValue(doc, 'green'),
            Step.sync(() => {
              AlloyTriggers.emit(input, NativeEvents.input());
            }),
            sAssertContainerClasses('Post: typing colour (green)', (s, str, arr) => [ arr.not('tox-textbox-field-invalid') ]),
            sAssertLegendBackground('After typing colour (green)', (s, str, arr) => str.is('green'))
          ])
        ),

        // TODO: Once we work out what we want to happen when the user types an incorrect colour again
        // add some tests for the desired interaction.
        Log.stepsAsStep('TBA', 'Check that can tab through the fields in the picker, and pressing enter on one of them submits if enabled, focuses the input, and sets the right value', [
          sOpenPicker,
          FocusTools.sTryOnSelector('Focus should be on red', doc, 'label:contains("R") + input'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),
          FocusTools.sTryOnSelector('Focus should be on green', doc, 'label:contains("G") + input'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),
          FocusTools.sTryOnSelector('Focus should be on blue', doc, 'label:contains("B") + input'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),
          FocusTools.sTryOnSelector('Focus should be on hex', doc, 'label:contains("#") + input'),
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          FocusTools.sTryOnSelector('Focus should be back on colorinput input', doc, '.colorinput-container > div:not(.test-sink) input'),
          sAssertFocusedValue('After pressing <enter> in hex', '#ffffff'),
          UiFinder.sNotExists(component.element(), '.tox-color-picker-container')
        ]),

        Log.stepsAsStep('TBA', 'Check that pressing enter on one of them does not submit if disabled', [
          sOpenPicker,
          FocusTools.sTryOnSelector('Focus should be on red', doc, 'label:contains("R") + input'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),
          FocusTools.sTryOnSelector('Focus should be on green', doc, 'label:contains("G") + input'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),
          FocusTools.sTryOnSelector('Focus should be on blue', doc, 'label:contains("B") + input'),
          Keyboard.sKeydown(doc, Keys.tab(), { }),
          FocusTools.sTryOnSelector('Focus should be on hex', doc, 'label:contains("#") + input'),
          FocusTools.sSetActiveValue(doc, 'invalid-colour'),
          Chain.asStep(doc, [
            FocusTools.cGetFocused,
            Chain.op((focused) => {
              component.getSystem().getByDom(focused).each((focusedComp) => {
                AlloyTriggers.emit(focusedComp, NativeEvents.input());
              });
            }),
            Chain.inject(component.element()),
            UiFinder.cWaitForVisible('Waiting for button to be disabled', 'button[disabled="disabled"]:contains("Ok")'),
          ]),
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          FocusTools.sTryOnSelector('Focus should be stay on hex because submit is disabled', doc, 'label:contains("#") + input'),
          UiFinder.sExists(component.element(), '.tox-color-picker-container'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          FocusTools.sTryOnSelector('Focus should be back on colorinput button (after escape)', doc, '.colorinput-container > div:not(.test-sink) span'),
          UiFinder.sNotExists(component.element(), '.tox-color-picker-container')
        ]),

        Log.stepsAsStep('TBA', 'Check that clicking Ok focuses the colorinput input field again, closes the picker, and sets the right value', [
          sOpenPicker,
          FocusTools.sTryOnSelector('Focus should be on red', doc, 'label:contains("R") + input'),
          FocusTools.sSetFocus('Move focus to hex', component.element(), 'label:contains("#") + input'),
          FocusTools.sSetActiveValue(doc, 'aaaacc'),
          Mouse.sClickOn(component.element(), 'button:contains("Ok")'),
          FocusTools.sTryOnSelector('Focus should be back on colorinput input', doc, '.colorinput-container > div:not(.test-sink) input'),
          sAssertFocusedValue('After clicking OK', '#aaaacc'),
          UiFinder.sNotExists(component.element(), '.tox-color-picker-container')
        ]),

        Log.stepsAsStep('TBA', 'Check that pressing escape inside the picker refocuses the colorinput button', [
          sOpenPicker,
          FocusTools.sTryOnSelector('Focus should be on red', doc, 'label:contains("R") + input'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          FocusTools.sTryOnSelector('Focus should be back on colorinput button (after escape)', doc, '.colorinput-container > div:not(.test-sink) span'),
          UiFinder.sNotExists(component.element(), '.tox-color-picker-container')
        ]),

        Log.stepsAsStep('TBA', 'Check that validating an empty string passes (first time)', [
          sSetColorInputValue(''),
          Step.wait(100),
          UiFinder.sNotExists(component.element(), '.tox-textbox-field-invalid')
        ]),

        Log.stepsAsStep('TBA', 'Check that validating an incorrect value fails', [
          sSetColorInputValue('dog'),
          Step.wait(100),
          UiFinder.sExists(component.element(), '.tox-textbox-field-invalid')
        ]),

        Log.stepsAsStep('TBA', 'Check that validating an empty is string passes', [
          sSetColorInputValue(''),
          Step.wait(100),
          UiFinder.sNotExists(component.element(), '.tox-textbox-field-invalid')
        ]),

        GuiSetup.mRemoveStyles
      ];
    },
    success,
    failure
  );
});