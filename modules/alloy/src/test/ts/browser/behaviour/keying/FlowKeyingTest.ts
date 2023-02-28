
import { FocusTools, Keyboard, Keys, TestStore } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarDocument, SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { SketchSpec } from 'ephox/alloy/api/component/SpecTypes';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

describe('browser.alloy.behaviour.keying.FlowKeyingTest', () => {

  const makeFlow = (store: TestStore, cycles: boolean): SketchSpec => {
    const item = (classes: string[], name: string) => Container.sketch({
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

    return Container.sketch({
      dom: {
        classes: [ 'flow-keying-test' ],
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
          onEscape: store.adderH('flow.onEscape'),
          cycles
        })
      ]),
      components: [
        item([ 'stay', 'one' ], 'one'),
        item([ 'stay', 'two' ], 'two'),
        item([ 'skip', 'three' ], 'three'),
        item([ 'skip', 'four' ], 'four'),
        item([ 'stay', 'five' ], 'five')
      ]
    });
  };

  GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    `.selected-item {
      background-color: #cadbee;
    }`
  ]);

  const sequence = async (doc: SugarElement<Document>, key: number, modifiers: { }, identifiers: Array<{ label: string; selector: string }>) => {
    const cases = Arr.range(identifiers.length, async (i: number) => {
      Keyboard.activeKeydown(doc, key, modifiers);
      await FocusTools.pTryOnSelector(
        'Focus should move from ' + (i > 0 ? identifiers[i - 1].label : '(start)') + ' to ' + identifiers[i].label,
        doc,
        identifiers[i].selector
      );
    });

    for (const c of cases) {
      await c;
    }
  };

  const hook = GuiSetup.bddSetup(
    (store) => GuiFactory.build(makeFlow(store, true))
  );

  const hookWithoutCycles = GuiSetup.bddSetup(
    (store) => GuiFactory.build(makeFlow(store, false))
  );

  const targets = {
    one: { label: 'one', selector: '.one' },
    two: { label: 'two', selector: '.two' },
    five: { label: 'five', selector: '.five' }
  };

  context('Testing FlowKeying', () => {
    it('Flow Keying Skip Element Test', async () => {
      const container = hook.component();
      const doc = hook.root();
      const store = hook.store();
      const keyLoger = GuiSetup.setupKeyLogger(hook.body());
      FocusTools.setFocus(container.element, '.one');

      await sequence(
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
      );
      await sequence(
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
      );
      await sequence(
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
      );
      await sequence(
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
      );

      // Test execute
      Keyboard.activeKeydown(doc, Keys.enter(), {});
      store.assertEq('Check that execute has fired on the right target', [ 'item.execute: one' ]);
      store.clear();

      Keyboard.activeKeyup(doc, Keys.escape(), {});
      store.assertEq('Check that escape handler has fired', [ 'flow.onEscape' ]);

      GuiSetup.teardownKeyLogger(keyLoger, [ ]);
    });

    it('TINY-9429: Flow with cycles false should stop on the first element when left is pressed and on the last when right is pressed', async () => {
      const container = hookWithoutCycles.component();
      const doc = hookWithoutCycles.root();
      const store = hookWithoutCycles.store();
      const keyLoger = GuiSetup.setupKeyLogger(hookWithoutCycles.body());
      FocusTools.setFocus(container.element, '.one');

      await sequence(
        doc,
        Keys.right(),
        { },
        [
          targets.two,
          targets.five,
          targets.five,
          targets.five,
          targets.five,
          targets.five
        ]
      );

      GuiSetup.teardownKeyLogger(keyLoger, [ ]);

      await sequence(
        doc,
        Keys.left(),
        { },
        [
          targets.two,
          targets.one,
          targets.one,
          targets.one,
          targets.one,
          targets.one
        ]
      );

      GuiSetup.teardownKeyLogger(keyLoger, [ ]);

      // Test execute
      Keyboard.activeKeydown(doc, Keys.enter(), {});
      store.assertEq('Check that execute has fired on the right target', [ 'item.execute: one' ]);
      store.clear();

      Keyboard.activeKeyup(doc, Keys.escape(), {});
      store.assertEq('Check that escape handler has fired', [ 'flow.onEscape' ]);

      GuiSetup.teardownKeyLogger(keyLoger, [ ]);
    });
  });
});
