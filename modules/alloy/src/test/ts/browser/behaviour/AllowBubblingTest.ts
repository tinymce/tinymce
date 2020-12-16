import { Logger, Step, StepSequence } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { AddEventsBehaviour, AllowBubbling, AlloyComponent, AlloyEvents } from 'ephox/alloy/api/Main';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('AllowBubblingTest', (success, failure) => {
  const sDispatchScrollEvent = <T> (comp: AlloyComponent): Step<T, T> => Step.sync(() => {
    const rawEl: Element = comp.element.dom;
    rawEl.dispatchEvent(new Event('scroll'));
  });

  GuiSetup.guiSetup((store, _doc, _body) => GuiFactory.build(
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
          AlloyEvents.run('bubbled.scroll', (_comp, _e) => {
            store.add('bubbled.scroll');
          })
        ])
      ])
    })
  ), (_doc, _body, _gui, component, store) =>
    Logger.t('Should fire simulated scroll event', StepSequence.sequenceSame([
      sDispatchScrollEvent(component),
      store.sAssertEq('Should have fired simulated scroll event', [ 'bubbled.scroll' ])
    ])),
  success, failure);
});
