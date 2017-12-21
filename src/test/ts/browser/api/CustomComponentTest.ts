import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import Container from 'ephox/alloy/api/ui/Container';
import DomModification from 'ephox/alloy/dom/DomModification';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('CustomComponentTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var bA = Cell(null);
  var bB = Cell(null);

  GuiSetup.setup(function (store, doc, body) {
    var behaviourA = Behaviour.create({
      fields: [ ],
      name: 'behaviourA',
      active: {
        exhibit: function (base, info) {
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
        behaveA: function (comp) {
          store.adder('behaveA')();
        }
      }
    });

    bA.set(behaviourA);

    var behaviourB = Behaviour.create({
      fields: [
        FieldSchema.strict('attr')
      ],
      name: 'behaviourB',
      active: {
        exhibit: function (base, info) {
          var extra = {
            attributes: {
              'behaviour-b-exhibit': info.attr()
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

  }, function (doc, body, gui, component, store) {
    return [
      Assertions.sAssertStructure(
        'Checking initial DOM modification',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            classes: [ arr.has('behaviour-a-exhibit'), arr.has('base-dom-modification') ],
            attrs: {
              'behaviour-b-exhibit': str.is('exhibition'),
              'data-alloy-id': str.is('custom-uid')
            }
          });
        }),
        component.element()
      ),

      store.sAssertEq('Nothing in store yet', [ ]),

      store.sClear,

      Step.sync(function () {
        AlloyTriggers.emitWith(component, 'alloy.custom.test.event', { message: 'event.data' });
      }),

      store.sAssertEq('Should now have a behaviour.a and behaviour.b event log with a before b', [
        'behaviour.a.event',
        'behaviour.b.event'
      ]),

      Step.sync(function () {
        bA.get().behaveA(component);
      }),

      store.sAssertEq('Should now have an Api log', [
        'behaviour.a.event',
        'behaviour.b.event',
        'behaveA'
      ]),

      Step.sync(function () {
        Assertions.assertEq('There should be no internal APIs on component', false, Objects.hasKey(component, 'apis'));
      })
    ];
  }, success, failure);
});

