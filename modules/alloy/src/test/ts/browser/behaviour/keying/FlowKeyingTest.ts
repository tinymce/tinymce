import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as NavigationUtils from 'ephox/alloy/test/NavigationUtils';

UnitTest.asynctest('Flow Keying Skip Element Test', (success, failure) => {
  GuiSetup.setup((store, doc, body) => {
    const item = (classes, name) => {
      return Container.sketch({
        dom: {
          tag: 'span',
          styles: {
            display: 'inline-block',
            width: '20px',
            height: '20px',
            margin: '2px',
            border: '1px solid ' + (Arr.contains(classes, 'stay') ? 'blue' : 'yellow')
          },
          classes
        },
        events: AlloyEvents.derive([
          AlloyEvents.runOnExecute(
            store.adder('item.execute: ' + name)
          )
        ]),
        containerBehaviours: Behaviour.derive([
          Focusing.config({ })
        ])
      });
    };

    return GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'flow-keying-test'],
          styles: {
            background: 'white',
            width: '200px',
            height: '200px'
          }
        },
        uid: 'custom-uid',
        containerBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'flow',
            selector: '.stay',
            onEscape: store.adderH('flow.onEscape')
          })
        ]),
        components: [
          item([ 'stay', 'one' ], 'one'),
          item([ 'stay', 'two' ], 'two'),
          item([ 'skip', 'three' ], 'three'),
          item([ 'skip', 'four' ], 'four'),
          item([ 'stay', 'five' ], 'five')
        ]
      })
    );
  }, (doc, body, gui, component, store) => {

    const targets = {
      one: { label: 'one', selector: '.one' },
      two: { label: 'two', selector: '.two' },
      five: { label: 'five', selector: '.five' }
    };

    return [
      GuiSetup.mSetupKeyLogger(body),
      FocusTools.sSetFocus('Initial focus', gui.element(), '.one'),
      NavigationUtils.sequence(
        doc,
        Keys.right(),
        {},
        [
          targets.two,
          targets.five,
          targets.one,
          targets.two,
          targets.five,
          targets.one
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.left(),
        { },
        [
          targets.five,
          targets.two,
          targets.one,
          targets.five,
          targets.two,
          targets.one
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.up(),
        { },
        [
          targets.five,
          targets.two,
          targets.one,
          targets.five,
          targets.two,
          targets.one
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.down(),
        { },
        [
          targets.two,
          targets.five,
          targets.one,
          targets.two,
          targets.five,
          targets.one
        ]
      ),

      // Test execute
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      store.sAssertEq('Check that execute has fired on the right target', [ 'item.execute: one' ]),
      store.sClear,

      Keyboard.sKeydown(doc, Keys.escape(), {}),
      store.sAssertEq('Check that escape handler has fired', [ 'flow.onEscape' ]),

      GuiSetup.mTeardownKeyLogger(body, [ ])
    ];
  }, () => {
    success();
  }, failure);
});
