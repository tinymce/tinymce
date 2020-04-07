import { Chain, UiFinder, Step, Logger, GeneralSteps, Assertions, FocusTools } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Highlighting } from 'ephox/alloy/api/behaviour/Highlighting';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as FocusManagers from 'ephox/alloy/api/focus/FocusManagers';
import { Attr } from '@ephox/sugar';

UnitTest.asynctest('Browser Test: behaviour.keying.FocusManagersTest', (success, failure) => {
  GuiSetup.setup(
    (store, _doc, _body) => GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'container' ]
      },
      components: Arr.map([ 1, 2, 3 ], (num) => ({
        dom: {
          tag: 'div',
          classes: [ 'candidate' ],
          attributes: {
            'data-index': num
          },
          innerHtml: 'Candidate-' + num
        },
        behaviours: Behaviour.derive([
          Focusing.config({ })
        ])
      })),

      behaviours: Behaviour.derive([
        Highlighting.config({
          itemClass: 'candidate',
          highlightClass: 'selected-candidate'
        }),

        AddEventsBehaviour.config('focus-manager-events', [
          AlloyEvents.run<SystemEvents.AlloyFocusShiftedEvent>(SystemEvents.focusShifted(), (_comp, se) => {
            const prevFocus = se.event().prevFocus();
            const newFocus = se.event().newFocus();
            const prevIndex = prevFocus.map((p) => Attr.get(p, 'data-index')).getOr('{none}');
            const newIndex = newFocus.map((p) => Attr.get(p, 'data-index')).getOr('{none}');
            store.adder(prevIndex + '->' + newIndex)();
          })
        ])
      ])
    }),

    (doc, _body, _gui, component, store) => {
      const highlightManager = FocusManagers.highlights();
      const domManager = FocusManagers.dom();

      const sFireFocusOn = (focusManager: FocusManagers.FocusManager, selector: string) => Chain.asStep(component.element(), [
        UiFinder.cFindIn(selector),
        Chain.op((elem) => {
          focusManager.set(component, elem);
        })
      ]);

      return [
        store.sClear,

        Logger.t(
          'Check that Highlights FocusManager fires event',
          GeneralSteps.sequence([
            Assertions.sAssertPresence('Checking no selected items', {
              '.selected-candidate': 0
            }, component.element()),

            sFireFocusOn(highlightManager, '[data-index="1"]'),
            store.sAssertEq('Checking highlights transitioned from none to 1', [ '{none}->1' ]),
            Assertions.sAssertPresence('Checking a selected item', {
              '.selected-candidate': 1
            }, component.element()),
            store.sClear,

            sFireFocusOn(highlightManager, '[data-index="2"]'),
            store.sAssertEq('Checking highlights transitioned from 1 to 2', [ '1->2' ]),

            Step.sync(() => {
              Highlighting.dehighlightAll(component);
            })
          ])
        ),

        store.sClear,

        Logger.t(
          'Check that Dom FocusManager fires event',
          GeneralSteps.sequence([
            sFireFocusOn(domManager, '[data-index="2"]'),
            store.sAssertEq('Checking dom transitioned from none to 2', [ '{none}->2' ]),
            FocusTools.sTryOnSelector('Focus should be on candidate 2', doc, '[data-index="2"]'),
            store.sClear,

            sFireFocusOn(domManager, '[data-index="1"]'),
            store.sAssertEq('Checking dom transitioned from 2 to 1', [ '2->1' ]),
            FocusTools.sTryOnSelector('Focus should be on candidate 1', doc, '[data-index="1"]')
          ])
        )
      ];
    },
    success,
    failure
  );
});
