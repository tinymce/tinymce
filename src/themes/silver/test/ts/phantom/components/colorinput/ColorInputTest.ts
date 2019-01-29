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
  TestHelpers,
} from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option, Result } from '@ephox/katamari';
import { SelectorFind, Traverse } from '@ephox/sugar';

import { renderColorInput } from 'tinymce/themes/silver/ui/dialog/ColorInput';
import I18n from 'tinymce/core/api/util/I18n';

const choiceItem: 'choiceitem' = 'choiceitem';

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

  TestHelpers.GuiSetup.setup(
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
             }, {
               interpreter: (x) => x,
               getSink: () => {
                 return memSink.getOpt(me).fold(
                   () => Result.error('Could not find the sink!'),
                   Result.value
                 );
               },
               providers: {
                 icons: () => <Record<string, string>> {},
                 menuItems: () => <Record<string, any>> {},
                 translate: I18n.translate,
              }
             }, {
               colorPicker: (callback, value) => {},
               hasCustomColors: () => true,
               getColors: () => [
                { type: choiceItem, text: 'Turquoise', value: '#18BC9B' },
                { type: choiceItem, text: 'Green', value: '#2FCC71' },
                { type: choiceItem, text: 'Blue', value: '#3598DB' },
                { type: choiceItem, text: 'Purple', value: '#9B59B6' },
                { type: choiceItem, text: 'Navy Blue', value: '#34495E' }
               ]
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
        'Clicking the legend should bring up the colorswatch',
        GeneralSteps.sequence([
          Mouse.sClickOn(legend.element(), 'root:span'),
          UiFinder.sWaitFor('Waiting for colorswatch to show up!', component.element(), '.tox-swatches')
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
        TestHelpers.GuiSetup.mAddStyles(doc, [
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

        Log.stepsAsStep('TBA', 'Check that pressing enter inside the picker refocuses the colorinput', [
          sOpenPicker,
          FocusTools.sTryOnSelector('Focus should be on a swatch', doc, 'div.tox-swatch'),
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          FocusTools.sTryOnSelector('Focus should be back on colorinput button (after escape)', doc, '.colorinput-container input'),
          sAssertFocusedValue('After pressing <enter> in hex', '#18BC9B'),
          UiFinder.sNotExists(component.element(), '.tox-swatches')
        ]),

        Log.stepsAsStep('TBA', 'Check that pressing escape inside the picker refocuses the colorinput button', [
          sOpenPicker,
          FocusTools.sTryOnSelector('Focus should be on a swatch', doc, 'div.tox-swatch'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          FocusTools.sTryOnSelector('Focus should be back on colorinput button (after escape)', doc, '.colorinput-container > div:not(.test-sink) span'),
          UiFinder.sNotExists(component.element(), '.tox-swatches')
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

        TestHelpers.GuiSetup.mRemoveStyles
      ];
    },
    success,
    failure
  );
});