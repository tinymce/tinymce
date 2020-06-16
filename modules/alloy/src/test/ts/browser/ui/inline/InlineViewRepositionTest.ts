import { Assertions, GeneralSteps, Logger, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Option, Result } from '@ephox/katamari';
import { Css, Element } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { InlineView } from 'ephox/alloy/api/ui/InlineView';
import * as Layout from 'ephox/alloy/positioning/layout/Layout';
import { NodeAnchorSpec } from 'ephox/alloy/positioning/mode/Anchoring';
import * as Sinks from 'ephox/alloy/test/Sinks';
import * as TestBroadcasts from 'ephox/alloy/test/TestBroadcasts';

UnitTest.asynctest('InlineViewRepositionTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => Sinks.relativeSink(), (_doc, _body, gui, component, store) => {
    const anchor = GuiFactory.build({
      dom: {
        tag: 'div',
        styles: {
          'height': '10px',
          'width': '10px',
          'background-color': 'red',
          'position': 'fixed',
          'top': '200px',
          'left': '200px'
        }
      }
    });

    const inline = GuiFactory.build(
      InlineView.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-inline' ]
        },

        lazySink() {
          return Result.value(component);
        },

        fireRepositionEventInstead: {
          event: 'test-reposition'
        },

        inlineBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('inline-reposition-test', [
            AlloyEvents.run('test-reposition', store.adder('test-reposition-fired'))
          ])
        ])
      })
    );

    const inline2 = GuiFactory.build(
      InlineView.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-inline2' ]
        },

        lazySink() {
          return Result.value(component);
        }
      })
    );

    gui.add(anchor);

    const sCheckOpen = (label: string, component: AlloyComponent, selector: string) => Logger.t(
      label,
      GeneralSteps.sequence([
        Waiter.sTryUntil(
          'Test inline should not be DOM',
          UiFinder.sExists(gui.element(), selector)
        ),
        Step.sync(() => {
          Assertions.assertEq('Checking isOpen API', true, InlineView.isOpen(component));
        })
      ])
    );

    const sCheckPosition = (label: string, element: Element, x: number, y: number) => Logger.t(
      label,
      Step.sync(() => {
        const top = parseInt(Css.get(element, 'top').replace('px', ''), 10);
        const left = parseInt(Css.get(element, 'left').replace('px', ''), 10);
        Assertions.assertEq('Checking top position', y, top);
        Assertions.assertEq('Checking left position', x, left);
      })
    );

    const anchorSpec: NodeAnchorSpec = {
      anchor: 'node',
      root: gui.element(),
      node: Option.some(anchor.element()),
      layouts: {
        onLtr: () => [ Layout.southeast ],
        onRtl: () => [ Layout.southeast ]
      }
    };

    return [
      Logger.t(
        'Show inline view with custom reposition',
        GeneralSteps.sequence([
          Step.sync(() => {
            InlineView.showAt(inline, anchorSpec, Container.sketch({
              components: [
                Button.sketch({ uid: 'bold-button', dom: { tag: 'button', innerHtml: 'B', classes: [ 'bold-button' ] }, action: store.adder('bold') })
              ]
            }));
          }),
          sCheckPosition('Check initial position', inline.element(), 200, 210),

          Step.sync(() => {
            Css.set(anchor.element(), 'top', '150px');
            Css.set(anchor.element(), 'left', '150px');
          }),

          TestBroadcasts.sReposition(
            'should not move on custom reposition',
            gui
          ),

          sCheckOpen('Dialog should still be open', inline, '.test-inline'),
          sCheckPosition('Check inline view has not moved', inline.element(), 200, 210),
          store.sAssertEq('Broadcasting SHOULD fire reposition event', [ 'test-reposition-fired' ])
        ])
      ),

      store.sClear,
      Step.sync(() => {
        InlineView.hide(inline);
      }),

      Logger.t(
        'Show inline view with normal reposition',
        GeneralSteps.sequence([
          Step.sync(() => {
            InlineView.showAt(inline2, anchorSpec, Container.sketch({
              components: [
                Button.sketch({ uid: 'bold-button2', dom: { tag: 'button', innerHtml: 'B', classes: [ 'bold-button' ] }, action: store.adder('bold') })
              ]
            }));
          }),
          sCheckPosition('Check initial position', inline2.element(), 150, 160),

          Step.sync(() => {
            Css.set(anchor.element(), 'top', '200px');
            Css.set(anchor.element(), 'left', '200px');
          }),

          TestBroadcasts.sReposition(
            'should move on normal reposition',
            gui
          ),

          sCheckOpen('Dialog should still be open', inline2, '.test-inline2'),
          sCheckPosition('Check inline view has moved', inline2.element(), 200, 210),
          store.sAssertEq('Broadcasting should NOT fire reposition event', [ ])
        ])
      )
    ];
  }, success, failure);
});
