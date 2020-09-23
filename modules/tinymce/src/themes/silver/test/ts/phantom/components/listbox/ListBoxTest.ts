import { ApproxStructure, Assertions, Chain, Keyboard, Keys, Mouse, Step, UiFinder, Waiter } from '@ephox/agar';
import { AlloyComponent, GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';

import { renderListBox } from 'tinymce/themes/silver/ui/dialog/ListBox';
import { DisablingSteps } from '../../../module/DisablingSteps';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import TestExtras from '../../../module/TestExtras';

UnitTest.asynctest('ListBox component Test', (success, failure) => {
  const helpers = TestExtras();
  const sink = SugarElement.fromDom(document.querySelector('.mce-silver-sink'));

  const sAssertValue = (label: string, component: AlloyComponent, expected: string) => Step.label(label, Chain.asStep(component.element, [
    UiFinder.cFindIn('.tox-listbox'),
    Chain.op((elem) => {
      Assertions.assertEq('Checking value of .tox-listbox', expected, Attribute.get(elem, 'data-value'));
    })
  ]));

  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build(
      renderListBox({
        name: 'selector',
        label: Optional.some('selector'),
        disabled: false,
        items: [
          { value: 'one', text: 'One' },
          { value: 'two', text: 'Two' },
          { text: 'Other', items: [
            { value: 'three', text: 'Three' }
          ] }
        ]
      }, helpers.backstage)
    ),
    (doc, _body, gui, component, _store) => [
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-form__group') ],
          children: [
            s.element('label', {
              classes: [ arr.has('tox-label') ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-listboxfield') ],
              children: [
                s.element('button', {
                  classes: [ arr.has('tox-listbox'), arr.has('tox-listbox--select') ],
                  attrs: {
                    'data-value': str.is('one')
                  },
                  children: [
                    s.element('span', {
                      classes: [ arr.has('tox-listbox__select-label') ],
                      children: [ s.text(str.is('One')) ]
                    }),
                    s.element('div', {
                      classes: [ arr.has('tox-listbox__select-chevron') ]
                    })
                  ]
                })
              ]
            })
          ]
        })),
        component.element
      ),

      RepresentingSteps.sSetValue('Choosing three', component, 'three'),
      sAssertValue('After setting "three"', component, 'three'),
      RepresentingSteps.sAssertComposedValue('Checking is three', 'three', component),

      // Invalid value
      RepresentingSteps.sSetValue('Choosing invalid value', component, 'invalid'),
      sAssertValue('After setting "invalid" should still be "three"', component, 'three'),

      // Disabling state
      DisablingSteps.sAssertDisabled('Initial disabled state', false, component),
      DisablingSteps.sSetDisabled('set disabled', component, true),
      DisablingSteps.sAssertDisabled('enabled > disabled', true, component),
      DisablingSteps.sSetDisabled('set enabled', component, false),
      DisablingSteps.sAssertDisabled('disabled > enabled', false, component),

      Mouse.sClickOn(gui.element, '.tox-listbox'),

      Waiter.sTryUntil(
        'Waiting for menu to appear',
        UiFinder.sExists(
          sink,
          '.tox-menu .tox-collection__item'
        )
      ),

      Chain.asStep(sink, [
        UiFinder.cFindIn('[role="menu"]'),
        Assertions.cAssertStructure(
          'Checking structure of menu (especially text)',
          ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [ arr.has('tox-menu'), arr.has('tox-collection--list'), arr.has('tox-collection') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: [
                  s.element('div', {
                    attrs: {
                      'aria-checked': str.is('false')
                    },
                    classes: [ arr.has('tox-collection__item') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-label') ],
                        html: str.is('One')
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-checkmark') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    attrs: {
                      'aria-checked': str.is('false')
                    },
                    classes: [ arr.has('tox-collection__item') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-label') ],
                        html: str.is('Two')
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-checkmark') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    attrs: {
                      'aria-expanded': str.is('false')
                    },
                    classes: [ arr.has('tox-collection__item') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-label') ],
                        html: str.is('Other')
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-caret') ]
                      })
                    ]
                  })
                ]
              })
            ]
          }))
        )
      ]),

      Keyboard.sKeystroke(doc, Keys.down(), { }),
      Keyboard.sKeystroke(doc, Keys.enter(), { }),
      sAssertValue('After setting keyboard selection', component, 'two')
    ],
    () => {
      helpers.destroy();
      success();
    },
    failure
  );
});
