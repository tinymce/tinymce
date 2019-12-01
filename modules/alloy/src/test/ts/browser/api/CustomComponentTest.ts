import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Obj } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as DomModification from 'ephox/alloy/dom/DomModification';
import * as Tagger from 'ephox/alloy/registry/Tagger';

UnitTest.asynctest('CustomComponentTest', (success, failure) => {

  type BehaviourA = Behaviour.AlloyBehaviour<any, any> & { behaveA: any };
  const bA = Cell<BehaviourA | null>(null);
  const bB = Cell<Behaviour.AlloyBehaviour<any, any> | null>(null);

  GuiSetup.setup((store, doc, body) => {
    const behaviourA = Behaviour.create({
      fields: [ ],
      name: 'behaviourA',
      active: {
        exhibit (base, info) {
          return DomModification.nu({
            classes: [ 'behaviour-a-exhibit' ]
          });
        },
        events: Fun.constant(
          AlloyEvents.derive([
            AlloyEvents.run('alloy.custom.test.event', store.adder('behaviour.a.event'))
          ])
        )
      },
      apis: {
        behaveA (comp) {
          store.adder('behaveA')();
        }
      }
    });

    bA.set(behaviourA);

    const behaviourB = Behaviour.create({
      fields: [
        FieldSchema.strict('attr')
      ],
      name: 'behaviourB',
      active: {
        exhibit (base, info: { attr: string}) {
          const extra = {
            attributes: {
              'behaviour-b-exhibit': info.attr
            }
          };
          return DomModification.nu(extra);
        },

        events: Fun.constant(
          AlloyEvents.derive([
            AlloyEvents.run('alloy.custom.test.event', store.adder('behaviour.b.event'))
          ])
        )
      }
    });

    bB.set(behaviourB);

    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'div',
          classes: [ 'custom-component-test']
        },
        uid: 'custom-uid',
        containerBehaviours: Behaviour.derive([
          behaviourA.config({ }),
          behaviourB.config({
            attr: 'exhibition'
          })
        ]),

        domModification: {
          classes: [ 'base-dom-modification' ]
        },

        eventOrder: {
          'alloy.custom.test.event': [ 'behaviourA', 'behaviourB' ]
        },
        components: [
          Container.sketch({ uid: 'custom-uid-2' })
        ]
      })
    );

  }, (doc, body, gui, component, store) => {
    return [
      Assertions.sAssertStructure(
        'Checking initial DOM modification',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('behaviour-a-exhibit'), arr.has('base-dom-modification') ],
            attrs: {
              'behaviour-b-exhibit': str.is('exhibition'),
              // This should no longer appear
              'data-alloy-id': str.none()
            }
          });
        }),
        component.element()
      ),
      Step.sync(() => {
        Assertions.assertEq('Tagger should read custom-uid', 'custom-uid', Tagger.readOrDie(component.element()));
      }),

      store.sAssertEq('Nothing in store yet', [ ]),

      store.sClear,

      Step.sync(() => {
        AlloyTriggers.emitWith(component, 'alloy.custom.test.event', { message: 'event.data' });
      }),

      store.sAssertEq('Should now have a behaviour.a and behaviour.b event log with a before b', [
        'behaviour.a.event',
        'behaviour.b.event'
      ]),

      Step.sync(() => {
        bA.get()!.behaveA(component);
      }),

      store.sAssertEq('Should now have an Api log', [
        'behaviour.a.event',
        'behaviour.b.event',
        'behaveA'
      ]),

      Step.sync(() => {
        Assertions.assertEq('There should be no internal APIs on component', false, Obj.hasNonNullableKey<any, string>(component, 'apis'));
      })
    ];
  }, success, failure);
});
