import { Assertions, GeneralSteps, Logger, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option, Result } from '@ephox/katamari';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { InlineView } from 'ephox/alloy/api/ui/InlineView';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as Sinks from 'ephox/alloy/test/Sinks';
import * as TestBroadcasts from 'ephox/alloy/test/TestBroadcasts';

UnitTest.asynctest('InlineViewTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    return Sinks.relativeSink();

  }, (doc, body, gui, component, store) => {
    const inline = GuiFactory.build(
      InlineView.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-inline' ]
        },

        lazySink () {
          return Result.value(component);
        },

        getRelated () {
          return Option.some(related);
        },

        fireDismissalEventInstead: {
          event: 'test-dismiss'
        },

        inlineBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('inline-dimiss-test', [
            AlloyEvents.run('test-dismiss', store.adder('test-dismiss-fired'))
          ])
        ])
      })
    );

    const related = GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'related-to-inline' ],
        styles: {
          background: 'blue',
          width: '50px',
          height: '50px'
        }
      }
    });

    gui.add(related);

    const sCheckOpen = (label) => {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          Waiter.sTryUntil(
            'Test inline should not be DOM',
            UiFinder.sExists(gui.element(), '.test-inline'),
            100,
            1000
          ),
          Step.sync(() => {
            Assertions.assertEq('Checking isOpen API', true, InlineView.isOpen(inline));
          })
        ])
      );
    };

    const sCheckClosed = (label) => {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          Waiter.sTryUntil(
            'Test inline should not be in DOM',
            UiFinder.sNotExists(gui.element(), '.test-inline'),
            100,
            1000
          ),
          Step.sync(() => {
            Assertions.assertEq('Checking isOpen API', false, InlineView.isOpen(inline));
          })
        ])
      );
    };

    return [
      UiFinder.sNotExists(gui.element(), '.test-inline'),
      Step.sync(() => {
        InlineView.showAt(inline, {
          anchor: 'selection',
          root: gui.element()
        }, Container.sketch({
          dom: {
            innerHtml: 'Inner HTML'
          }
        }));
      }),
      sCheckOpen('After show'),

      Step.sync(() => {
        InlineView.hide(inline);
      }),

      sCheckClosed('After hide'),

      Logger.t(
        'Show inline view again with different content',
        Step.sync(() => {
          InlineView.showAt(inline, {
            anchor: 'selection',
            root: gui.element()
          }, Container.sketch({
            components: [
              Button.sketch({ uid: 'bold-button', dom: { tag: 'button', innerHtml: 'B', classes: [ 'bold-button' ] }, action: store.adder('bold') })
            ]
          }));
        })
      ),

      sCheckOpen('Should still be open with a button'),
      store.sClear,

      TestBroadcasts.sDismissOn(
        'toolbar: should not close',
        gui,
        '.bold-button'
      ),

      sCheckOpen('Broadcasting dismiss on button should not close inline toolbar'),
      store.sAssertEq('Broadcasting on button should not fire dismiss event', [ ]),


      TestBroadcasts.sDismiss(
        'related element: should not close',
        gui,
        related.element()
      ),
      sCheckOpen('The inline view should not have fired dismiss event when broadcasting on related'),
      store.sAssertEq('Broadcasting on related element should not fire dismiss event', [ ]),

      TestBroadcasts.sDismiss(
        'outer gui element: should close',
        gui,
        gui.element()
      ),

      sCheckOpen('Dialog should stay open, because we are firing an event instead of dismissing automatically'),
      store.sAssertEq('Broadcasting on outer element SHOULD fire dismiss event', [ 'test-dismiss-fired' ])

    ];
  }, () => { success(); }, failure);
});
