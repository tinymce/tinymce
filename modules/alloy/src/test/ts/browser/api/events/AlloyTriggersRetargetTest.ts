import { Chain, Logger, Mouse, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Classes, EventArgs, SelectorFind } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('AlloyTriggersRetargetTest', (success, failure) => {
  /*
   * The intention of this test is to transfer a click event from
   * the original-recipient to the redirected-recipient, and check
   * that it's target has changed
   */
  GuiSetup.setup(
    (store, _doc, _body) => GuiFactory.build(
      {
        dom: {
          tag: 'div',
          classes: [ 'parent-container' ]
        },
        components: [
          {
            dom: {
              tag: 'div',
              classes: [ 'original-recipient' ]
            },
            behaviours: Behaviour.derive([
              AddEventsBehaviour.config('original-events', [
                // Redispatch event to redirected-recipient
                AlloyEvents.run<EventArgs<MouseEvent, Element>>(
                  NativeEvents.click(),
                  (rComp, se) => {
                    store.adder('Received at original-recipient')();

                    const retargetTo = SelectorFind.ancestor(rComp.element, '.parent-container').bind(
                      (parent) => SelectorFind.descendant(parent, '.redirected-recipient')
                    ).getOrDie('Could not find recipient for redirect');

                    AlloyTriggers.retargetAndDispatchWith(
                      rComp,
                      retargetTo,
                      se.event.raw.type,
                      se.event
                    );
                  }
                )
              ])
            ])
          },
          {
            dom: {
              tag: 'div',
              classes: [ 'redirected-recipient' ]
            },
            behaviours: Behaviour.derive([
              AddEventsBehaviour.config('recipient-events', [
                // Write to the store with the target information.
                AlloyEvents.run<EventArgs<MouseEvent, Element>>(
                  NativeEvents.click(),
                  (rComp, se) => {
                    const targetClasses = Classes.get(se.event.target).join(', ');
                    store.adder(
                      `Received at redirected-recipient with target: ${targetClasses}`
                    )();
                  }
                )
              ])
            ])
          }
        ]
      }
    ),
    (_doc, _body, _gui, component, store) => [
      Logger.t(
        'Trigger a click on the original recipient',
        Chain.isolate(component, Chain.fromChains([
          UiFinder.cFindIn('.original-recipient'),
          Mouse.cClickWith({ })
        ]))
      ),

      Logger.t(
        'Ensure that the event was received by redirected-recipient',
        store.sAssertEq(
          'Store should reflect that the mouse event was redirected',
          [
            'Received at original-recipient',
            'Received at redirected-recipient with target: redirected-recipient'
          ]
        )
      )
    ],
    success,
    failure
  );
});
