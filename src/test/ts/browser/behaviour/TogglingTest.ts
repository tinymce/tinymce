import { ApproxStructure, Assertions, Logger, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import { Container } from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('TogglingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'div',
          classes: [ 'custom-component-test'],
          styles: {
            background: 'blue',
            width: '200px',
            height: '200px'
          }
        },
        uid: 'custom-uid',
        containerBehaviours: Behaviour.derive([
          Toggling.config({
            selected: true,
            toggleClass: 'test-selected',
            aria: {
              mode: 'pressed'
            }
          })
        ])
      })
    );

  }, function (doc, body, gui, component, store) {

    const testIsSelected = function (label) {
      return Step.sync(function () {
        Assertions.assertStructure(
          'Asserting structure shows selected\n' + label,
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              classes: [
                arr.has('test-selected'),
                arr.not('selected')
              ],
              attrs: {
                'data-alloy-id': str.is('custom-uid'),
                'aria-pressed': str.is('true'),
                'aria-expanded': str.none()
              }
            });
          }),
          component.element()
        );
      });
    };

    const testNotSelected = function (label) {
      return Step.sync(function () {
        Assertions.assertStructure(
          'Asserting structure shows not selected\n' + label,
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              classes: [
                arr.not('test-selected'),
                arr.not('selected')
              ],
              attrs: {
                'data-alloy-id': str.is('custom-uid'),
                'aria-pressed': str.is('false'),
                'aria-expanded': str.none()
              }
            });
          }),
          component.element()
        );
      });
    };

    const assertIsSelected = function (label, expected) {
      return Logger.t(
        'Asserting isSelected()\n' + label,
        Step.sync(function () {
          const actual = Toggling.isOn(component);
          Assertions.assertEq(label, expected, actual);
        })
      );
    };

    const sSelect = Step.sync(function () {
      Toggling.on(component);
    });

    const sDeselect = Step.sync(function () {
      Toggling.off(component);
    });

    const sToggle = Step.sync(function () {
      Toggling.toggle(component);
    });

    return [
      testIsSelected('Initial'),

      sToggle,
      testNotSelected('selected > toggle'),
      assertIsSelected('selected > toggle', false),

      sToggle,
      testIsSelected('selected > toggle, toggle'),
      assertIsSelected('selected > toggle, toggle', true),

      sDeselect,
      testNotSelected('selected > toggle, toggle, deselect'),
      assertIsSelected('selected > toggle, toggle, deselect', false),
      sDeselect,
      testNotSelected('selected > toggle, toggle, deselect, deselect'),
      assertIsSelected('selected > toggle, toggle, deslect, deselect', false),

      sSelect,
      testIsSelected('selected > toggle, toggle, deselect, deselect, select'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select', true),
      sSelect,
      testIsSelected('selected > toggle, toggle, deselect, deselect, select, select'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select, select', true),

      Step.sync(function () {
        AlloyTriggers.emitExecute(component);
      }),

      testNotSelected('selected > toggle, toggle, deselect, deselect, select, select, event.exec'),
      assertIsSelected('selected > toggle, toggle, deselect, deselect, select, select, event.exec', false)
    ];
  }, success, failure);
});
