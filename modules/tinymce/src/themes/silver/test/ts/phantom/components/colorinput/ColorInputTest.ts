import {
  ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Logger, Mouse, Step, UiFinder, Waiter
} from '@ephox/agar';
import { AlloyTriggers, Container, GuiFactory, Invalidating, NativeEvents, Representing, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { SelectorFind, SugarElement, Traverse } from '@ephox/sugar';

import { renderColorInput } from 'tinymce/themes/silver/ui/dialog/ColorInput';

import TestExtras from '../../../module/TestExtras';

const choiceItem: 'choiceitem' = 'choiceitem';

// TODO: Expose properly through alloy.
UnitTest.asynctest('Color input component Test', (success, failure) => {
  const helpers = TestExtras();
  const sink = SugarElement.fromDom(document.querySelector('.mce-silver-sink'));

  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'colorinput-container' ]
        },
        components: [
          renderColorInput({
            name: 'alpha',
            label: Optional.some('test-color-input')
          }, helpers.shared, {
            colorPicker: (_callback, _value) => {},
            hasCustomColors: Fun.always,
            getColors: () => [
              { type: choiceItem, text: 'Turquoise', value: '#18BC9B' },
              { type: choiceItem, text: 'Green', value: '#2FCC71' },
              { type: choiceItem, text: 'Blue', value: '#3598DB' },
              { type: choiceItem, text: 'Purple', value: '#9B59B6' },
              { type: choiceItem, text: 'Navy Blue', value: '#34495E' }
            ],
            getColorCols: () => 3
          })
        ]
      })
    ),
    (doc, _body, _gui, component, _store) => {
      const input = component.getSystem().getByDom(
        SelectorFind.descendant(component.element, 'input').getOrDie('Could not find input in colorinput')
      ).getOrDie();

      const legend = component.getSystem().getByDom(
        // Intentionally, only finding direct child
        SelectorFind.descendant(component.element, 'span').getOrDie('Could not find legend in colorinput')
      ).getOrDie();

      const sSetColorInputValue = (newValue: string) => Step.sync(() => {
        // Once we put more identifying marks on a colorinput, use that instead.
        const colorinput = component.components()[0];
        Representing.setValue(colorinput, newValue);
      });

      const sOpenPicker = Logger.t(
        'Clicking the legend should bring up the colorswatch',
        GeneralSteps.sequence([
          Mouse.sClickOn(legend.element, 'root:span'),
          UiFinder.sWaitFor('Waiting for colorswatch to show up!', sink, '.tox-swatches')
        ])
      );

      const sAssertFocusedValue = (label: string, expected: string) => Logger.t(label, Chain.asStep(sink, [
        FocusTools.cGetActiveValue,
        Assertions.cAssertEq('Checking value of focused element', expected)
      ]));

      const sAssertLegendBackground = (label: string, f) => Assertions.sAssertStructure(
        label + ': Checking background of legend button',
        ApproxStructure.build((s, str, arr) => s.element('span', {
          styles: {
            'background-color': f(s, str, arr)
          }
        })),
        legend.element
      );

      const sAssertContainerClasses = (label: string, f) => Waiter.sTryUntil(
        label + ': Checking classes on container',
        Assertions.sAssertStructure(
          'Checking classes only',
          ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: f(s, str, arr)
            // ignore children
          })),
          Traverse.parent(input.element).getOrDie('Could not find parent of input')
        )
      );

      return [
        TestHelpers.GuiSetup.mAddStyles(doc, [
          '.tox-textbox-field-invalid input { outline: 2px solid red; }',
          '.tox-color-input span { padding: 4px 8px; }',
          '.tox-swatch { padding: 8px 4px }'
        ]),
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
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
          })),
          component.element
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
            FocusTools.sSetFocus('Move focus to input field', component.element, 'input'),
            FocusTools.sSetActiveValue(doc, 'notblue'),
            Step.sync(() => {
              AlloyTriggers.emit(input, NativeEvents.input());
            }),

            sAssertContainerClasses('Post: typing invalid colour (notblue)', (_s, _str, arr) => [ arr.has('tox-textbox-field-invalid') ]),
            sAssertLegendBackground('After typing invalid colour (notblue)', (_s, str, _arr) => str.none())
          ])
        ),

        Logger.t(
          'Type a valid colour',
          GeneralSteps.sequence([
            FocusTools.sSetActiveValue(doc, 'green'),
            Step.sync(() => {
              AlloyTriggers.emit(input, NativeEvents.input());
            }),
            sAssertContainerClasses('Post: typing colour (green)', (_s, _str, arr) => [ arr.not('tox-textbox-field-invalid') ]),
            sAssertLegendBackground('After typing colour (green)', (_s, str, _arr) => str.is('green'))
          ])
        ),

        Log.stepsAsStep('TBA', 'Check that pressing enter inside the picker refocuses the colorinput', [
          sOpenPicker,
          FocusTools.sTryOnSelector('Focus should be on a swatch', doc, 'div.tox-swatch'),
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          FocusTools.sTryOnSelector('Focus should be back on colorinput button (after escape)', doc, '.colorinput-container input'),
          sAssertFocusedValue('After pressing <enter> in hex', '#18BC9B'),
          UiFinder.sNotExists(sink, '.tox-swatches')
        ]),

        Log.stepsAsStep('TBA', 'Check that pressing escape inside the picker refocuses the colorinput button', [
          sOpenPicker,
          FocusTools.sTryOnSelector('Focus should be on a swatch', doc, 'div.tox-swatch'),
          Keyboard.sKeydown(doc, Keys.escape(), { }),
          FocusTools.sTryOnSelector('Focus should be back on colorinput button (after escape)', doc, '.colorinput-container > div:not(.mce-silver-sink) span'),
          UiFinder.sNotExists(sink, '.tox-swatches')
        ]),

        Log.stepsAsStep('TBA', 'Check that validating an empty string passes (first time)', [
          sSetColorInputValue(''),
          Step.wait(50),
          UiFinder.sNotExists(component.element, '.tox-textbox-field-invalid')
        ]),

        Log.stepsAsStep('TBA', 'Check that validating an incorrect value fails', [
          sSetColorInputValue('dog'),
          Step.wait(50),
          UiFinder.sExists(component.element, '.tox-textbox-field-invalid')
        ]),

        Log.stepsAsStep('TBA', 'Check that validating an empty is string passes', [
          sSetColorInputValue(''),
          Step.wait(50),
          UiFinder.sNotExists(component.element, '.tox-textbox-field-invalid')
        ]),

        TestHelpers.GuiSetup.mRemoveStyles
      ];
    }, () => {
      helpers.destroy();
      success();
    },
    failure
  );
});
