import { ApproxStructure, Assertions, FocusTools, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Value } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import { DatasetRepresentingState } from 'ephox/alloy/behaviour/representing/RepresentState';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';
import { TypeaheadData } from 'ephox/alloy/ui/types/TypeaheadTypes';

UnitTest.asynctest('RepresentingTest (mode: dataset)', (success, failure) => {
  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'input'
        },
        containerBehaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'dataset',
              initialValue: 'dog',
              initialDataset: [ { value: 'dog', text: 'Dog' } ],
              getDataKey (component) {
                return Value.get(component.element());
              },
              getFallbackEntry (key) {
                return { value: key.toLowerCase(), text: key };
              },
              setValue: (comp, data) => {
                Value.set(comp.element(), data.text);
              }
            }
          })
        ])
      })
    );
  }, (doc, body, gui, component, store) => {
    const sAssertRepValue = (label, expected) => {
      return Step.sync(() => {
        const v = Representing.getValue(component);
        Assertions.assertEq(label, expected, v);
      });
    };

    const sUpdateDataset = (newItems: TypeaheadData[]) => {
      return Step.sync(() => {
        const repState = Representing.getState(component) as DatasetRepresentingState;
        repState.update(newItems);
      });
    };

    return [
      Assertions.sAssertStructure(
        'Initial value should be "dog"',
        ApproxStructure.build((s, str, arr) => {
          return s.element('input', {
            value: str.is('Dog')
          });
        }),
        component.element()
      ),

      sAssertRepValue('Checking represented value on load', { value: 'dog', text: 'Dog' }),

      FocusTools.sSetFocus('Setting of focus on input field', gui.element(), 'input'),
      FocusTools.sSetActiveValue(doc, 'Cat'),
      // Note, Value.set does not actually dispatch the event, so we have to simulate it.
      Step.sync(() => {
        AlloyTriggers.emit(component, NativeEvents.input());
      }),

      sAssertRepValue('Checking represented value after change', { value: 'cat', text: 'Cat' }),

      Step.sync(() => {
        Representing.setValue(component, 'elephant');
      }),

      sAssertRepValue('Checking represented value after setValue but before update', { value: 'elephant', text: 'elephant' }),

      sUpdateDataset([
        { value: 'elephant', text: 'Baby Elephant Walk' }
      ]),

      Step.sync(() => {
        Representing.setValue(component, 'elephant');
      }),

      sAssertRepValue('Checking represented value after setValue but after update', { value: 'elephant', text: 'Baby Elephant Walk' }),
      Assertions.sAssertStructure(
        'Value should be "Baby Elephant Walk"',
        ApproxStructure.build((s, str, arr) => {
          return s.element('input', {
            value: str.is('Baby Elephant Walk')
          });
        }),
        component.element()
      )
    ];
  }, () => { success(); }, failure);
});
