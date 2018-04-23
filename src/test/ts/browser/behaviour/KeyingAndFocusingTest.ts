import { FocusTools, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('Browser Test: behaviour.KeyingAndFocusingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  // The purpose of this test is to check that when a component has
  // keying and focusing, that the keying behaviour's focusIn fires
  // after the focusing
  GuiSetup.setup(
    function (store, doc, body) {
      const memChild = Memento.record({
        uid: 'child',
        dom: {
          tag: 'span',
          classes: [ 'child' ],
          innerHtml: 'child',
          styles: {
            background: 'black',
            color: 'white',
            padding: '10px'
          }
        },
        behaviours: Behaviour.derive([
          Focusing.config({ })
        ])
      });

      return GuiFactory.build({
        dom: {
          tag: 'div',
          classes: [ 'parent' ],
          styles: {
            background: 'blue',
            padding: '10px',
            width: '400px'
          }
        },
        components: [
          memChild.asSpec()
        ],
        behaviours: Behaviour.derive([
          Focusing.config({ }),
          Keying.config({
            mode: 'special',
            focusIn (comp) {
              const child = memChild.get(comp);
              Focusing.focus(child);
            }
          })
        ])
      });
    },
    function (doc, body, gui, component, store) {
      return [
        GuiSetup.mAddStyles(doc, [
          ':focus { outline: 10px solid green; }'
        ]),
        Step.sync(function () {
          AlloyTriggers.dispatchFocus(component, component.element());
        }),
        FocusTools.sTryOnSelector('Focus should be on child span', doc, 'span.child'),
        GuiSetup.mRemoveStyles
      ];
    },
    success, failure
  );
});
