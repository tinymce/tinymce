import { FocusTools } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import Keying from 'ephox/alloy/api/behaviour/Keying';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Memento from 'ephox/alloy/api/component/Memento';
import AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('Browser Test: behaviour.KeyingAndFocusingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  // The purpose of this test is to check that when a component has
  // keying and focusing, that the keying behaviour's focusIn fires
  // after the focusing
  GuiSetup.setup(
    function (store, doc, body) {
      var memChild = Memento.record({
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
            focusIn: function (comp) {
              var child = memChild.get(comp);
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

