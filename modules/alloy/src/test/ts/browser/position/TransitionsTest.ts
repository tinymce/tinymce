import { Waiter } from '@ephox/agar';
import { afterEach, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, Classes, SugarDocument } from '@ephox/sugar';
import { assert } from 'chai';

import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import { GuiSetup } from 'ephox/alloy/api/testhelpers/TestHelpers';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { PlacementSpec } from 'ephox/alloy/behaviour/positioning/PositioningTypes';
import * as Layout from 'ephox/alloy/positioning/layout/Layout';
import * as LayoutInset from 'ephox/alloy/positioning/layout/LayoutInset';
import { Layouts } from 'ephox/alloy/positioning/mode/Anchoring';
import { TransitionMode } from 'ephox/alloy/positioning/view/Transitions';
import * as PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

interface Scenario {
  readonly spec: PlacementSpec;
  readonly expectTransition: boolean;
  readonly waitForCompletion?: boolean;
}

describe.skip('browser.alloy.position.TransitionsTest', () => {
  const transitionTime = 75;
  const northLayout = {
    onLtr: () => [ Layout.north ],
    onRtl: () => [ Layout.north ]
  };
  const northInsetLayout = {
    onLtr: () => [ LayoutInset.north ],
    onRtl: () => [ LayoutInset.north ]
  };

  const memButton1 = Memento.record(Button.sketch({
    action: Fun.noop,
    dom: {
      styles: {
        position: 'absolute',
        left: '100px',
        top: '150px'
      },
      innerHtml: 'Button 1',
      tag: 'button'
    },
    uid: 'button1'
  }));

  const memButton2 = Memento.record(Button.sketch({
    action: Fun.noop,
    dom: {
      styles: {
        position: 'absolute',
        left: '500px',
        top: '250px'
      },
      innerHtml: 'Button 2',
      tag: 'button'
    },
    uid: 'button2'
  }));

  const sinks = Sinks.bddSetup();
  const gui = GuiSetup.bddSetup((store, _doc, _body) => {
    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(sinks.fixed()),
          GuiFactory.premade(sinks.relative()),
          GuiFactory.premade(sinks.popup()),
          GuiFactory.premade(GuiFactory.build(memButton1.asSpec())),
          GuiFactory.premade(GuiFactory.build(memButton2.asSpec()))
        ],
        events: AlloyEvents.derive([
          AlloyEvents.run(NativeEvents.transitionend(), store.adder('transitionend')),
          AlloyEvents.run(NativeEvents.transitioncancel(), store.adder('transitioncancel'))
        ])
      })
    );
  });

  GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    `.transition {
      transition: ${transitionTime}ms ease;
      transition-property: left, right, top, bottom;
    }`
  ]);

  beforeEach(() => {
    gui.store().clear();
  });

  afterEach(() => {
    Positioning.reset(sinks.relative(), sinks.popup());
    Positioning.reset(sinks.fixed(), sinks.popup());
  });

  const getHotspotPlacementSpec = (hotspot: AlloyComponent, transitionMode: TransitionMode = 'all', layouts?: Layouts): PlacementSpec => ({
    anchor: {
      type: 'hotspot',
      hotspot,
      layouts
    },
    transition: {
      classes: [ 'transition' ],
      mode: transitionMode
    }
  });

  const getMakeshiftPlacementSpec = (x: number, y: number, transitionMode: TransitionMode = 'all', layouts?: Layouts): PlacementSpec => ({
    anchor: {
      type: 'makeshift',
      x,
      y,
      layouts
    },
    transition: {
      classes: [ 'transition' ],
      mode: transitionMode
    }
  });

  const assertClasses = (label: string, classes: string[]) => {
    assert.deepEqual(Classes.get(sinks.popup().element), classes, label);
  };

  const pTestNoTransition = async (sinkName: string, sink: AlloyComponent, spec: PlacementSpec) => {
    await PositionTestUtils.pTestSink(sinkName, sink, sinks.popup(), spec);
    assertClasses('No classes added for transition', []);
    gui.store().assertEq('No transition events', []);
  };

  const pTestTransition = async (sinkName: string, sink: AlloyComponent, scenarios: Scenario[], events: string[]) => {
    // Wait a while between tests, sometimes there are cancel events that pop in
    await Waiter.pWait(transitionTime * 2);
    gui.store().clear();
    // Position initially at the first button
    const button1 = memButton1.get(gui.component());
    await PositionTestUtils.pTestSink(sinkName, sink, sinks.popup(), getHotspotPlacementSpec(button1));
    assertClasses(`No classes added for first transition in ${sinkName} sink`, []);

    // Run through placing each spec
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      await PositionTestUtils.pTestSink(sinkName, sink, sinks.popup(), scenario.spec);
      if (scenario.expectTransition) {
        assertClasses(`Has transition class for transition ${i + 1} in ${sinkName} sink`, [ 'transition' ]);

        if (scenario.waitForCompletion === false) {
          await Waiter.pWait(transitionTime / 2);
        } else {
          await Waiter.pTryUntilPredicate('Transition ends within expected timeframe', () => Classes.get(sinks.popup().element).length === 0, 10, transitionTime * 2);
        }
      } else {
        assertClasses(`No classes added for transition ${i + 1} in ${sinkName} sink`, []);
      }
    }

    // Wait for the transitions to complete
    await Waiter.pTryUntil('Wait for transition to complete', () => {
      assertClasses(`Transition classes removed for ${sinkName} sink`, []);
      assert.isFalse(Attribute.has(sinks.popup().element, 'data-alloy-transition-timer'), 'Transition timer attribute should not be set');
      gui.store().assertEq(`Transition events for ${sinkName} sink`, events);
    }, 10, transitionTime * 3);
  };

  it('TINY-7740: should not add the transition class when first positioning', async () => {
    const hotspot = memButton1.get(gui.component());
    const spec = getHotspotPlacementSpec(hotspot);
    await pTestNoTransition('relative', sinks.relative(), spec);
    await pTestNoTransition('fixed', sinks.fixed(), spec);
  });

  it('TINY-7740: should not transition when not configured', async () => {
    const hotspot = memButton1.get(gui.component());
    const scenarios: Scenario[] = [
      { spec: { anchor: { type: 'hotspot', hotspot }}, expectTransition: false }
    ];
    await pTestTransition('relative', sinks.relative(), scenarios, []);
    await pTestTransition('fixed', sinks.fixed(), scenarios, []);
  });

  it('TINY-7740: should not transition when positioning in the same location', async () => {
    const button1 = memButton1.get(gui.component());
    const scenarios: Scenario[] = [
      { spec: getHotspotPlacementSpec(button1), expectTransition: false }
    ];
    await pTestTransition('relative', sinks.relative(), scenarios, []);
    await pTestTransition('fixed', sinks.fixed(), scenarios, []);
  });

  it('TINY-7740: should add the transition class when moving to the next element', async () => {
    const button2 = memButton2.get(gui.component());
    const scenarios: Scenario[] = [
      { spec: getHotspotPlacementSpec(button2), expectTransition: true }
    ];

    // We should have 2 events, one for each direction (left/top)
    const expectedEvents = [ 'transitionend', 'transitionend' ];
    await pTestTransition('relative', sinks.relative(), scenarios, expectedEvents);
    await pTestTransition('fixed', sinks.fixed(), scenarios, expectedEvents);
  });

  it('TINY-7740: should keep transitioning when moved during a transition', async () => {
    const button1 = memButton1.get(gui.component());
    const button2 = memButton2.get(gui.component());
    const scenarios: Scenario[] = [
      { spec: getHotspotPlacementSpec(button2), expectTransition: true, waitForCompletion: false },
      { spec: getHotspotPlacementSpec(button1), expectTransition: true, waitForCompletion: true }
    ];

    const expectedEvents = [ 'transitioncancel', 'transitioncancel', 'transitionend', 'transitionend' ];
    await pTestTransition('relative', sinks.relative(), scenarios, expectedEvents);
    await pTestTransition('fixed', sinks.fixed(), scenarios, expectedEvents);
  });

  it('TINY-7740: all transition mode should transition on any change', async () => {
    const button2 = memButton2.get(gui.component());
    const scenarios: Scenario[] = [
      { spec: getHotspotPlacementSpec(button2, 'all'), expectTransition: true },
      { spec: getMakeshiftPlacementSpec(100, 200, 'all'), expectTransition: true }
    ];

    // Note: We have 2 of each event, one for each direction (left/top)
    const expectedEvents = [ 'transitionend', 'transitionend', 'transitionend', 'transitionend' ];
    await pTestTransition('relative', sinks.relative(), scenarios, expectedEvents);
    await pTestTransition('fixed', sinks.fixed(), scenarios, expectedEvents);
  });

  it('TINY-7740: layout transition mode should only transition when the layout changes', async () => {
    const button2 = memButton2.get(gui.component());
    const scenarios: Scenario[] = [
      { spec: getMakeshiftPlacementSpec(500, 300, 'layout'), expectTransition: false },
      { spec: getHotspotPlacementSpec(button2, 'layout', northLayout), expectTransition: true }
    ];

    const expectedEvents = [ 'transitionend', 'transitionend' ];
    await pTestTransition('relative', sinks.relative(), scenarios, expectedEvents);
    await pTestTransition('fixed', sinks.fixed(), scenarios, expectedEvents);
  });

  it('TINY-7740: placement transition mode should only transition when the placement changes', async () => {
    const button1 = memButton1.get(gui.component());
    const scenarios: Scenario[] = [
      { spec: getMakeshiftPlacementSpec(100, 300, 'placement'), expectTransition: false },
      { spec: getHotspotPlacementSpec(button1, 'placement', northLayout), expectTransition: true },
      { spec: getHotspotPlacementSpec(button1, 'placement', northInsetLayout), expectTransition: false }
    ];

    const expectedEvents = [ 'transitionend', 'transitionend' ];
    await pTestTransition('relative', sinks.relative(), scenarios, expectedEvents);
    await pTestTransition('fixed', sinks.fixed(), scenarios, expectedEvents);
  });

  it('TINY-7740: should stop transitioning once the duration passes if repositioned and the mode doesn\'t trigger a new transition', async () => {
    // Position initially at the first button
    const button1 = memButton1.get(gui.component());
    await PositionTestUtils.pTestSink('relative', sinks.relative(), sinks.popup(), getHotspotPlacementSpec(button1, 'placement'));
    await PositionTestUtils.pTestSink('relative', sinks.relative(), sinks.popup(), getMakeshiftPlacementSpec(100, 300, 'placement', northLayout));
    assertClasses('Has started to transition', [ 'transition' ]);
    // Wait half the transition time
    await Waiter.pWait(transitionTime / 2);

    await PositionTestUtils.pTestSink('relative', sinks.relative(), sinks.popup(), getMakeshiftPlacementSpec(100, 350, 'placement', northLayout));
    assertClasses('Still transitioning', [ 'transition' ]);
    // Wait the rest of the transition time, plus ~2 frames and make sure the transition is complete
    await Waiter.pTryUntil('The transition should have completed', () => assertClasses('Transition Complete', [ ]), 10, transitionTime * 2);

    const expectedEvents = [ 'transitioncancel', 'transitioncancel' ];
    await Waiter.pTryUntil('Transition events', () => gui.store().assertEq('Transition events', expectedEvents), 10, 100);

  });
});
