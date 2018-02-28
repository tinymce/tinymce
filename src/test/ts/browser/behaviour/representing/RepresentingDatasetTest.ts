import { ApproxStructure, Assertions, FocusTools, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Value } from '@ephox/sugar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Representing from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('RepresentingTest (mode: dataset)', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'input'
        },
        containerBehaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'dataset',
              initialValue: {
                value: 'dog',
                text: 'Dog'
              },
              setData (component, data) {
                Value.set(component.element(), data.text);
              },
              getDataKey (component) {
                return Value.get(component.element());
              },
              getFallbackEntry (key) {
                return { value: key.toLowerCase(), text: key };
              }
            }
          })
        ])
      })
    );
  }, function (doc, body, gui, component, store) {
    const sAssertValue = function (label, expected) {
      return Step.sync(function () {
        const v = Representing.getValue(component);
        Assertions.assertEq(label, expected, v);
      });
    };

    return [
      Assertions.sAssertStructure(
        'Initial value should be "dog"',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('input', {
            value: str.is('Dog')
          });
        }),
        component.element()
      ),

      sAssertValue('Checking represented value on load', { value: 'dog', text: 'Dog' }),

      FocusTools.sSetFocus('Setting of focus on input field', gui.element(), 'input'),
      FocusTools.sSetActiveValue(doc, 'Cat'),
      // Note, Value.set does not actually dispatch the event, so we have to simulate it.
      Step.sync(function () {
        AlloyTriggers.emit(component, NativeEvents.input());
      }),

      sAssertValue('Checking represented value after change', { value: 'cat', text: 'Cat' }),

      Step.sync(function () {
        Representing.setValue(component, {
          value: 'elephant',
          text: 'Elephant'
        });
      }),

      sAssertValue('Checking represented value after setValue', { value: 'elephant', text: 'Elephant' }),
      Assertions.sAssertStructure(
        'Value should be "Elephant"',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('input', {
            value: str.is('Elephant')
          });
        }),
        component.element()
      )
    ];
  }, function () { success(); }, failure);
});
