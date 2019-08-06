import { GeneralSteps, Logger, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Element, Event } from '@ephox/dom-globals';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { AddEventsBehaviour, AllowBubbling, AlloyComponent, AlloyEvents } from 'ephox/alloy/api/Main';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('AllowBubblingTest', (success, failure) => {
  const sDispatchScrollEvent = (comp: AlloyComponent) => {
    return Step.sync(() => {
      const rawEl: Element = comp.element().dom();
      rawEl.dispatchEvent(new Event('scroll'));
    });
  };

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'div'
        },
        containerBehaviours: Behaviour.derive([
          AllowBubbling.config({
            events: [
              {
                native: 'scroll',
                simulated: 'bubbled.scroll'
              }
            ]
          }),
          AddEventsBehaviour.config('events', [
            AlloyEvents.run('bubbled.scroll', (comp, e) => {
              store.add('bubbled.scroll');
            })
          ])
        ])
      })
    );

  }, (doc, body, gui, component, store) => {
    return [
      Logger.t('Should fire simulated scroll event', GeneralSteps.sequence([
        sDispatchScrollEvent(component),
        store.sAssertEq('Should have fired simulated scroll event', [ 'bubbled.scroll' ])
      ])),
    ];
  }, () => { success(); }, failure);
});
