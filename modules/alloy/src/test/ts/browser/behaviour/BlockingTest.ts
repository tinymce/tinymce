import { Chain, Log, Step, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional, OptionalInstances } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Blocking } from 'ephox/alloy/api/behaviour/Blocking';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { TestStore } from 'ephox/alloy/api/testhelpers/TestHelpers';

UnitTest.asyncTest('BlockingTest', (success, failure) => {
  const blockRoot = Memento.record({
    dom: {
      tag: 'div'
    },
    behaviours: Behaviour.derive([
      Replacing.config({})
    ])
  });

  const makeComponent = (store: TestStore, _doc: SugarElement<Document>, _body: SugarElement<HTMLBodyElement>) => {
    const component = GuiFactory.build({
      dom: {
        tag: 'div'
      },
      components: [
        blockRoot.asSpec()
      ],
      behaviours: Behaviour.derive([
        Blocking.config({
          getRoot: () => blockRoot.getOpt(component),
          onBlock: store.adder('block'),
          onUnblock: store.adder('unblock')
        })
      ])
    });

    return component;
  };

  GuiSetup.setup(makeComponent, (doc, body, gui, comp, store) => {
    const sBlock = (fn?: (behaviour: Record<string, Behaviour.ConfiguredBehaviour<any, any>>) => AlloySpec) => Step.sync(() => Blocking.block(comp, fn));
    const sUnblock = Step.sync(() => Blocking.unblock(comp));

    return [
      Log.stepsAsStep('TINY-6487', 'Blocking events are fired', [
        store.sClear,
        sBlock(),
        sUnblock,
        store.sAssertEq('Block event was registered', [ 'block', 'unblock' ])
      ]),

      Log.stepsAsStep('TINY-6487', 'Blocking events are not duplicated', [
        store.sClear,
        sBlock(),
        sBlock(),
        sBlock(),
        sUnblock,
        sBlock(),
        sUnblock,
        sUnblock,
        store.sAssertEq('Block event was registered correct number of times', [ 'block', 'unblock', 'block', 'unblock' ])
      ]),

      Log.stepsAsStep('TINY-6487', 'Component is marked as busy / unusable', [
        sBlock(),
        Step.sync(() =>
          Assert.eq('Aria-blocked is set on the component', Optional.some('true'), Attribute.getOpt(comp.element, 'aria-busy'), OptionalInstances.tOptional())
        ),
        sUnblock,
        Step.sync(() =>
          Assert.eq('Aria-blocked is set on the component', Optional.none<string>(), Attribute.getOpt(comp.element, 'aria-busy'), OptionalInstances.tOptional())
        )
      ]),

      Log.stepsAsStep('TINY-6487', 'Blocker is created', [
        sBlock((behaviours) => ({
          dom: {
            tag: 'div',
            classes: [ 'put-spinner-here' ]
          },
          behaviours
        })),
        UiFinder.sExists(blockRoot.get(comp).element, 'div.put-spinner-here'),
        sUnblock,
        UiFinder.sNotExists(blockRoot.get(comp).element, 'div.put-spinner-here')
      ]),

      Log.stepsAsStep('TINY-6487', 'Only one blocker is created', [
        sBlock((behaviours) => ({
          dom: {
            tag: 'div',
            classes: [ 'put-spinner-here' ]
          },
          behaviours
        })),
        sBlock((behaviours) => ({
          dom: {
            tag: 'div',
            classes: [ 'put-spinner-here' ]
          },
          behaviours
        })),
        Chain.asStep(blockRoot.get(comp).element, [
          UiFinder.cFindAllIn('div.put-spinner-here'),
          Chain.mapper((xs) => xs.length),
          Chain.op((count) => Assert.eq('Only one spinner', 1, count))
        ]),
        sUnblock
      ])
    ];
  }, success, failure);
});