import { ApproxStructure, Assertions, Chain, Log, Step, TestStore, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Blocking } from 'ephox/alloy/api/behaviour/Blocking';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asyncTest('BlockingTest', (success, failure) => {
  const memBlockRoot = Memento.record({
    dom: {
      tag: 'div'
    },
    behaviours: Behaviour.derive([
      Replacing.config({})
    ])
  });

  const makeComponent = (store: TestStore, _doc: SugarElement<Document>, _body: SugarElement<Node>) => {
    const component = GuiFactory.build({
      dom: {
        tag: 'div'
      },
      components: [
        memBlockRoot.asSpec()
      ],
      behaviours: Behaviour.derive([
        Blocking.config({
          getRoot: () => memBlockRoot.getOpt(component),
          onBlock: store.adder('block'),
          onUnblock: store.adder('unblock')
        })
      ])
    });

    return component;
  };

  GuiSetup.setup(makeComponent, (doc, body, gui, comp, store) => {
    const sBlock = (fn?: (comp: AlloyComponent, behaviour: Behaviour.AlloyBehaviourRecord) => AlloySpec) =>
      Step.sync(() => Blocking.block(comp, fn === undefined ? Fun.constant({ dom: { tag: 'div' }}) : fn));

    const sUnblock = Step.sync(() => Blocking.unblock(comp));

    return [
      Log.stepsAsStep('TINY-6487', 'Block handlers are called', [
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
        Assertions.sAssertStructure('Aria-blocked is set',
          ApproxStructure.build((struct, str, _arr) => struct.element('div', {
            attrs: {
              'aria-busy': str.is('true')
            }
          })),
          comp.element
        ),
        sUnblock,
        Assertions.sAssertStructure('Aria-blocked is unset',
          ApproxStructure.build((struct, str, _arr) => struct.element('div', {
            attrs: {
              'aria-busy': str.none()
            }
          })),
          comp.element
        )
      ]),

      Log.stepsAsStep('TINY-6487', 'Blocker is created', [
        sBlock((_comp, behaviours) => ({
          dom: {
            tag: 'div',
            classes: [ 'put-spinner-here' ]
          },
          behaviours
        })),
        UiFinder.sExists(memBlockRoot.get(comp).element, 'div.put-spinner-here'),
        sUnblock,
        UiFinder.sNotExists(memBlockRoot.get(comp).element, 'div.put-spinner-here')
      ]),

      Log.stepsAsStep('TINY-6487', 'Only one blocker is created', [
        sBlock((_comp, behaviours) => ({
          dom: {
            tag: 'div',
            classes: [ 'put-spinner-here' ]
          },
          behaviours
        })),
        sBlock((_comp, behaviours) => ({
          dom: {
            tag: 'div',
            classes: [ 'put-spinner-here' ]
          },
          behaviours
        })),
        Chain.asStep(memBlockRoot.get(comp).element, [
          UiFinder.cFindAllIn('div.put-spinner-here'),
          Chain.op((xs) => Assert.eq('Only one spinner', 1, xs.length))
        ]),
        sUnblock
      ]),

      Log.stepsAsStep('TINY-6487', 'Changing the blocker affects the dom', [
        sBlock((_comp, behaviours) => ({
          dom: {
            tag: 'div',
            classes: [ 'spinner-1' ]
          },
          behaviours
        })),
        Assertions.sAssertPresence('Spinner 1 present', {
          'div.spinner-1': 1
        }, comp.element),
        sBlock((_comp, behaviours) => ({
          dom: {
            tag: 'div',
            classes: [ 'spinner-2' ]
          },
          behaviours
        })),
        Assertions.sAssertPresence('Spinner 2 present', {
          'div.spinner-1': 0,
          'div.spinner-2': 1
        }, comp.element)
      ])
    ];
  }, success, failure);
});
