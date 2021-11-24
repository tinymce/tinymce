import { Assertions, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Step, Touch, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Focus, Value } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { ExpandableForm } from 'ephox/alloy/api/ui/ExpandableForm';
import { Form } from 'ephox/alloy/api/ui/Form';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { HtmlSelect } from 'ephox/alloy/api/ui/HtmlSelect';
import { Input } from 'ephox/alloy/api/ui/Input';
import * as TestForm from 'ephox/alloy/test/form/TestForm';
import { FormParts } from 'ephox/alloy/ui/types/FormTypes';

UnitTest.asynctest('ExpandableFormTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => {

    const pMinimal = ExpandableForm.parts.minimal(
      Form.sketch((parts: FormParts) => ({
        dom: {
          tag: 'div',
          classes: [ 'minimal-form', 'form-section' ]
        },
        components: [
          parts.field('form.ant', FormField.sketch({
            uid: 'input-ant',
            dom: {
              tag: 'div'
            },
            components: [
              FormField.parts.field({
                factory: Input,
                data: 'init',
                inputBehaviours: Behaviour.derive([
                  Tabstopping.config({ })
                ])
              }),
              FormField.parts.label({ dom: { tag: 'label', innerHtml: 'a' }, components: [ ] })
            ]
          }))
        ]
      }))
    );

    const pExtra = ExpandableForm.parts.extra(
      Form.sketch((parts: FormParts) => ({
        dom: {
          tag: 'div',
          classes: [ 'extra-form', 'form-section' ]
        },
        components: [
          Container.sketch({ dom: { styles: { height: '100px', width: '100px', background: 'green' }}}),
          parts.field('form.bull', FormField.sketch({
            uid: 'select-bull',
            dom: {
              tag: 'div'
            },
            components: [
              FormField.parts.field({
                factory: HtmlSelect,
                selectBehaviours: Behaviour.derive([
                  Tabstopping.config({ })
                ]),
                options: [
                  { value: 'select-b-init', text: 'Select-b-init' },
                  { value: 'select-b-set', text: 'Select-b-set' },
                  { value: 'select-b-other', text: 'Select-b-other' }
                ]
              }),

              FormField.parts.label({ dom: { tag: 'label', innerHtml: 'a' }, components: [ ] })
            ]
          }))
        ]
      }))
    );

    const me = GuiFactory.build(
      ExpandableForm.sketch({
        dom: {
          tag: 'div'
        },

        components: [
          pMinimal,
          ExpandableForm.parts.expander({
            dom: {
              tag: 'button',
              innerHtml: '+',
              classes: [ 'test-expander-button' ]
            },
            components: [ ],
            buttonBehaviours: Behaviour.derive([
              Tabstopping.config({ })
            ])
          }),
          pExtra,

          Button.sketch({
            dom: {
              tag: 'button',
              innerHtml: 'Shrink!'
            },
            action: (_button) => {
              ExpandableForm.collapseFormImmediately(me);
            },
            buttonBehaviours: Behaviour.derive([
              Tabstopping.config({ })
            ])
          }),

          ExpandableForm.parts.controls({
            dom: {
              tag: 'div',
              classes: [ 'form-controls' ]
            },
            components: [ ]
          })
        ],

        expandableBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'cyclic',
            visibilitySelector: '.form-section'
          })
        ]),

        markers: {
          closedClass: 'expandable-closed',
          openClass: 'expandable-open',
          shrinkingClass: 'expandable-shrinking',
          growingClass: 'expandable-growing',

          expandedClass: 'expandable-expanded',
          collapsedClass: 'expandable-collapsed'
        }
      })
    );

    return me;

  }, (doc, _body, gui, component, _store) => {
    const helper = TestForm.helper(component);

    return [
      GuiSetup.mAddStyles(doc, [
        '.expandable-collapsed .extra-form { visibility: hidden; opacity: 0; }',
        '.expandable-expanded .extra-form { visibility: visible, opacity: 1; }',
        '.expandable-growing .extra-form { transition: height 0.3s ease, opacity 0.2s linear 0.1s; }',
        '.expandable-shrinking .extra-form { transition: opacity 0.3s ease, height 0.2s linear 0.1s, visibility 0s linear 0.3s; }'
      ]),
      helper.sAssertRep({
        'form.ant': 'init',
        'form.bull': 'select-b-init'
      }),

      helper.sSetRep({
        'form.ant': 'first.set',
        'form.bull': 'select-b-set'
      }),

      Logger.t(
        'Checking form after set',
        helper.sAssertRep({
          'form.ant': 'first.set',
          'form.bull': 'select-b-set'
        })
      ),

      Logger.t(
        'Retrieve the ant field directly and check its value (in minimal)',
        GeneralSteps.sequence([
          Step.sync(() => {
            const field = Form.getField(component, 'form.ant').getOrDie('Could not find field for ant');
            Assertions.assertEq('Checking value', 'first.set', Value.get(field.element));
          })
        ])
      ),

      Logger.t(
        'Retrieve the bull field directly and check its value (in extra)',
        GeneralSteps.sequence([
          Step.sync(() => {
            const field = Form.getField(component, 'form.bull').getOrDie('Could not find field for bull');
            Assertions.assertEq('Checking value', 'select-b-set', Value.get(field.element));
          })
        ])
      ),

      Step.sync(() => {
        Keying.focusIn(component);
      }),

      FocusTools.sTryOnSelector('Focus should start on input field', doc, 'input'),
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector('Focus should move to expand/collapse button', doc, 'button:contains("+")'),
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector('Focus should move to select', doc, 'select'),
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector('Focus should move to shrink', doc, 'button:contains("Shrink!")'),

      Keyboard.sKeydown(doc, Keys.enter(), {}),
      Logger.t(
        'Shrinking immediately should not cause any animation',
        UiFinder.sNotExists(gui.element, '.expandable-shrinking')
      ),
      // Check immediately
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector('Focus should start on input field', doc, 'input'),
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector('Focus should move to expand/collapse button', doc, 'button:contains("+")'),
      Keyboard.sKeydown(doc, Keys.tab(), {}),
      FocusTools.sTryOnSelector('Focus should skip the collapsed select and jump to shrink', doc, 'button:contains("Shrink!")'),

      Logger.t(
        'Checking the representing value is still the same when collapsed',
        helper.sAssertRep({
          'form.ant': 'first.set',
          'form.bull': 'select-b-set'
        })
      ),

      // Expand the form, focus the part in the extra, and click on expand again and check focus is still in dialog
      Logger.t(
        'Expanding form, focusing part in extra, clicking on expand, and checking focus still in dialog',
        GeneralSteps.sequence([
          Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
          FocusTools.sTryOnSelector('Focus should move back to expand/collapse button', doc, 'button:contains("+")'),
          Keyboard.sKeydown(doc, Keys.enter(), {}),

          Waiter.sTryUntil(
            'Waiting until it has stopped growing',
            UiFinder.sNotExists(gui.element, '.expandable-growing')
          ),

          Keyboard.sKeydown(doc, Keys.tab(), {}),
          FocusTools.sTryOnSelector('Focus should move onto select', doc, 'select'),

          Keyboard.sKeydown(doc, Keys.tab(), { shiftKey: true }),
          FocusTools.sTryOnSelector('Focus should move onto select', doc, '.test-expander-button'),
          Keyboard.sKeydown(doc, Keys.enter(), {}),

          Waiter.sTryUntil(
            'Waiting until it has stopped shrinking',
            UiFinder.sNotExists(gui.element, '.expandable-shrinking'),
            10,
            10000
          ),

          Mouse.sClickOn(gui.element, '.test-expander-button'),

          Waiter.sTryUntil(
            'Waiting until it has stopped growing',
            UiFinder.sNotExists(gui.element, '.expandable-growing')
          ),

          Step.async((next, die) => {
            Focus.search(component.element).fold(() => {
              die('The focus has not stayed in the form');
            }, next);
          }),

          Touch.sTapOn(gui.element, '.test-expander-button'),

          Waiter.sTryUntil(
            'Waiting until it has stopped shrinking',
            UiFinder.sNotExists(gui.element, '.expandable-shrinking'),
            10,
            10000
          ),

          Step.async((next, die) => {
            Focus.search(component.element).fold(() => {
              die('The focus has not stayed in the form');
            }, next);
          })
        ])
      ),

      Step.sync(() => {
        ExpandableForm.expandForm(component);
      }),
      UiFinder.sExists(gui.element, '.expandable-growing'),
      Waiter.sTryUntil(
        'Waiting until it has stopped growing',
        UiFinder.sNotExists(gui.element, '.expandable-growing'),
        10,
        10000
      ),

      Step.sync(() => {
        ExpandableForm.collapseForm(component);
      }),
      UiFinder.sExists(gui.element, '.expandable-shrinking'),
      Waiter.sTryUntil(
        'Waiting until it has stopped shrinking',
        UiFinder.sNotExists(gui.element, '.expandable-shrinking'),
        10,
        10000
      ),

      GuiSetup.mRemoveStyles
    ];
  }, success, failure);
});
