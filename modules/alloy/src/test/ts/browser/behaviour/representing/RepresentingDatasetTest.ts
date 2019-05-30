import { ApproxStructure, Assertions, FocusTools, Step, UiControls } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Value } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import { DatasetRepresentingState } from 'ephox/alloy/behaviour/representing/RepresentState';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
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
              initialValue: {
                value: 'dog',
                meta: {
                  text: 'Hund'
                }
              },
              getDataKey (component) {
                return Value.get(component.element());
              },
              getFallbackEntry (key) {
                return { value: 'fallback.' + key.toLowerCase(), meta: { text: key } };
              },
              setValue: (comp, data) => {
                Value.set(comp.element(), data.meta.text);
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
        'Initial value should be "Hund"',
        ApproxStructure.build((s, str, arr) => {
          return s.element('input', {
            value: str.is('Hund')
          });
        }),
        component.element()
      ),

      sAssertRepValue('Checking represented value on load', { value: 'dog', meta: { text: 'Hund' } }),

      FocusTools.sSetFocus('Setting of focus on input field', gui.element(), 'input'),
      FocusTools.sSetActiveValue(doc, 'Katze'),

      sAssertRepValue('Checking represented value after change', {
        value: 'fallback.katze',
        meta: {
          text: 'Katze'
        }
      }),

      FocusTools.sSetActiveValue(doc, 'Elephant'),

      sAssertRepValue('Checking represented value after set input but before update', {
        value: 'fallback.elephant',
        meta: {
          text: 'Elephant'
        }
      }),

      sUpdateDataset([
        { value: 'big.e', meta: { text: 'Elephant' } }
      ]),

      sAssertRepValue('Checking represented value after set input but after update', {
        value: 'big.e',
        meta: {
          text: 'Elephant'
        }
      }),
      Assertions.sAssertStructure(
        'Test will be Elephant."',
        ApproxStructure.build((s, str, arr) => {
          return s.element('input', {
            value: str.is('Elephant')
          });
        }),
        component.element()
      )
    ];
  }, () => { success(); }, failure);
});
