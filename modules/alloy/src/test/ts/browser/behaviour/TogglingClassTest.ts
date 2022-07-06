import { ApproxStructure, Assertions, Logger, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('TogglingClassTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div',
        classes: [ 'custom-component-test' ],
        styles: {
          background: 'blue',
          width: '200px',
          height: '200px'
        }
      },
      containerBehaviours: Behaviour.derive([
        Toggling.config({
          selected: false,
          toggleClass: 'test-selected',
          aria: {
            mode: 'pressed'
          },
          onToggled: store.adder('toggled')
        })
      ])
    })
  ), (_doc, _body, _gui, component, store) => {

    const testIsSelected = (label: string) => Step.sync(() => {
      Assertions.assertStructure(
        'Asserting structure shows selected\n' + label,
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [
            arr.has('test-selected'),
            arr.not('selected')
          ],
          attrs: {
            'aria-pressed': str.is('true'),
            'aria-expanded': str.none()
          }
        })),
        component.element
      );
    });

    const testNotSelected = (label: string) => Step.sync(() => {
      Assertions.assertStructure(
        'Asserting structure shows not selected\n' + label,
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [
            arr.not('test-selected'),
            arr.not('selected')
          ],
          attrs: {
            'aria-pressed': str.is('false'),
            'aria-expanded': str.none()
          }
        })),
        component.element
      );
    });

    const assertIsSelected = (label: string, expected: boolean) => Logger.t(
      'Asserting isSelected()\n' + label,
      Step.sync(() => {
        const actual = Toggling.isOn(component);
        Assertions.assertEq(label, expected, actual);
      })
    );

    const sSelect = Step.sync(() => {
      Toggling.on(component);
    });

    const sDeselect = Step.sync(() => {
      Toggling.off(component);
    });

    const sToggleSet = (state: boolean) => Step.sync(() => {
      Toggling.set(component, state);
    });

    const sToggle = Step.sync(() => {
      Toggling.toggle(component);
    });

    return [
      testNotSelected('Initial'),
      store.sAssertEq('Should not have a toggled event since the item is not selected', []),

      sToggle,
      testIsSelected('selected > toggle'),
      assertIsSelected('selected > toggle', true),
      store.sAssertEq('Should have a toggled event after toggling on', [ 'toggled' ]),

      sDeselect,
      testNotSelected('selected > toggle, toggle, deselect'),
      assertIsSelected('selected > toggle, toggle, deselect', false),
      store.sAssertEq('Should have a toggled event after toggling off', [ 'toggled', 'toggled' ]),

      sDeselect,
      testNotSelected('selected > toggle, toggle, deselect, deselect'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect', false),
      store.sAssertEq('No additional toggle events should have fired', [ 'toggled', 'toggled' ]),

      sSelect,
      testIsSelected('selected > toggle, toggle, deselect, deselect, select'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select', true),
      sSelect,
      testIsSelected('selected > toggle, toggle, deselect, deselect, select, select'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select, select', true),

      sToggleSet(false),
      testNotSelected('selected > toggle, toggle, deselect, deselect, select, deselect'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select, deselect', false),
      sToggleSet(false),
      testNotSelected('selected > toggle, toggle, deselect, deselect, select, deselect, deselect'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select, deselect, deselect', false),

      sToggleSet(true),
      testIsSelected('selected > toggle, toggle, deselect, deselect, select, deselect, deselect, select'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select, deselect, deselect, select', true),
      sToggleSet(true),
      testIsSelected('selected > toggle, toggle, deselect, deselect, select, deselect, deselect, select, select'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select, deselect, deselect, select, select', true),

      Step.sync(() => {
        AlloyTriggers.emitExecute(component);
      }),

      testNotSelected('selected > toggle, toggle, deselect, deselect, select, deselect, deselect, select, select, event.exec'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select, deselect, deselect, select, select, event.exec', false)
    ];
  }, success, failure);
});
