import { ApproxStructure, Assertions, Chain, FocusTools, Mouse, UiFinder } from '@ephox/agar';
import { GuiFactory, NativeEvents, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';

import { renderSizeInput } from 'tinymce/themes/silver/ui/dialog/SizeInput';
import { DomSteps } from '../../../module/DomSteps';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import TestProviders from '../../../module/TestProviders';

UnitTest.asynctest('SizeInput component Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderSizeInput({
          name: 'dimensions',
          label: Option.some('size'),
          constrain: true,
          disabled: false
        }, TestProviders)
      );
    },
    (doc, body, gui, component, store) => {

      const sTriggerInput = DomSteps.sTriggerEventOnFocused('input("input")', component, NativeEvents.input());

      const sSetDimensions = (width: string, height: string) => RepresentingSteps.sSetValue('dimensions', component, { width, height });

      const sAssertDimensions = (width: string, height: string) => RepresentingSteps.sAssertValue('dimensions', { width, height }, component);

      const sAssertLocked = (locked: boolean) =>
        Chain.asStep(component.element(), [
          UiFinder.cFindIn('.tox-lock'),
          Chain.op((lock) => {
            Assertions.assertStructure(
              'Checking lock has toggled',
              ApproxStructure.build((s, str, arr) => {
                return s.element('button', {
                  classes: [
                    arr.has('tox-lock'),
                    arr.has('tox-button'),
                    (locked ? arr.has : arr.not)('tox-locked')]
                });
              }),
              lock
            );
          })
        ]);

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-form__group')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-form__controls-h-stack')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-form__group')],
                      children: [
                        s.element('label', {
                          classes: [arr.has('tox-label')],
                          html: str.is('Width')
                        }),
                        s.element('input', {
                          classes: [arr.has('tox-textfield')],
                          attrs: {
                            'data-alloy-tabstop': str.is('true')
                          }
                        })
                      ]
                    }),
                    s.element('div', {
                      classes: [arr.has('tox-form__group')],
                      children: [
                        s.element('label', {
                          classes: [arr.has('tox-label')],
                          html: str.is('Height')
                        }),
                        s.element('input', {
                          classes: [arr.has('tox-textfield')],
                          attrs: {
                            'data-alloy-tabstop': str.is('true')
                          }
                        })
                      ]
                    }),
                    s.element('div', {
                      classes: [arr.has('tox-form__group')],
                      children: [
                        s.element('label', {
                          classes: [arr.has('tox-label')],
                          html: str.is('&nbsp;')
                        }),
                        s.element('button', {
                          classes: [arr.has('tox-lock'), arr.has('tox-button'), arr.has('tox-locked')]
                        })
                      ]
                    })
                  ]
                })
              ]
            });
          }),
          component.element()
        ),
        sAssertLocked(true),
        sSetDimensions('100px', '200px'),
        FocusTools.sSetFocus('Focusing the first field', component.element(), 'input:first'),
        FocusTools.sSetActiveValue(doc, '50'),
        sTriggerInput,
        sAssertDimensions('50', '100px'),
        // toggle off the lock
        Mouse.sClickOn(component.element(), 'button.tox-lock'),
        sAssertLocked(false),
        // now when we update the first field it will not update the second field
        FocusTools.sSetFocus('Focusing the first field', component.element(), 'input:first'),
        FocusTools.sSetActiveValue(doc, '300px'),
        sTriggerInput,
        sAssertDimensions('300px', '100px')
      ];
    },
    success,
    failure
  );
});
