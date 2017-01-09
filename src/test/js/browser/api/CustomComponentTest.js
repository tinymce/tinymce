asynctest(
  'CustomComponentTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell'
  ],
 
  function (ApproxStructure, Assertions, Step, GuiFactory, BehaviourExport, Container, EventHandler, DomModification, GuiSetup, FieldSchema, Objects, Fun, Cell) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var bA = Cell(null);
    var bB = Cell(null);

    GuiSetup.setup(function (store, doc, body) {
      var behaviourA = BehaviourExport.santa([ ], 'behaviourA', {
        exhibit: function (base, info) {
          return DomModification.nu({
            classes: [ 'behaviour-a-exhibit' ]
          });
        },
        events: Fun.constant({
          'alloy.custom.test.event': EventHandler.nu({
            run: function (component) {
              store.adder('behaviour.a.event')();
            }
          })
        })
      }, {
        behaveA: function (comp) {
          store.adder('behaveA')();
        }
      }, { });

      bA.set(behaviourA);

      var behaviourB = BehaviourExport.santa([
        FieldSchema.strict('attr')
      ], 'behaviourB', {
        exhibit: function (base, info) {
          var extra = {
            attributes: {
              'behaviour-b-exhibit': info.attr()
            }
          };
          return DomModification.nu(extra);
        },
        
        events: Fun.constant({
          'alloy.custom.test.event': EventHandler.nu({
            run: function (component) {
              store.adder('behaviour.b.event')();
            }
          })
        })
      }, { }, { });

      bB.set(behaviourB);

      return GuiFactory.build(
        Container.build({
          dom: {
            tag: 'div',
            classes: [ 'custom-component-test']
          },
          uid: 'custom-uid',
          customBehaviours: [
            behaviourA,
            behaviourB
          ],
          behaviours: {
            'behaviourA': { },
            'behaviourB': {
              attr: 'exhibition'
            }
          },
     
          eventOrder: {
            'alloy.custom.test.event': [ 'behaviourA', 'behaviourB' ]
          },
          components: [
            Container.build({ uid: 'custom-uid-2' })
          ]
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure(
          'Checking initial DOM modification',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              classes: [ arr.has('behaviour-a-exhibit') ],
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
          component.getSystem().triggerEvent(
            'alloy.custom.test.event',
            component.element(),
            'event.data'
          );
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
 

  }
);