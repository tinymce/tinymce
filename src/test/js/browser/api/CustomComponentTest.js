asynctest(
  'CustomComponentTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.behaviour.CustomBehaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],
 
  function (ApproxStructure, Assertions, Logger, Step, GuiFactory, CustomBehaviour, EventHandler, DomModification, GuiSetup, FieldSchema, ValueSchema, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var behaviourA = CustomBehaviour('behaviourA', {
        exhibit: function (info, base) {
          return DomModification.nu({
            classes: [ 'behaviour-a-exhibit' ]
          });
        },

        handlers: Fun.constant({
          'alloy.custom.test.event': EventHandler.nu({
            run: function (component) {
              store.adder('behaviour.a.event')();
            }
          })
        }),
        apis: Fun.constant({
          'behave': store.adder('behaviour.a.apis.behave'),
          'behaveA': store.adder('behaviour.a.apis.behaveA')
        }),
        schema: Fun.constant(
          ValueSchema.anyValue()
        )
      });

      var behaviourB = CustomBehaviour('behaviourB', {
        exhibit: function (info, base) {
          var extra = {
            attributes: {
              'behaviour-b-exhibit': info.attr()
            }
          };
          return DomModification.nu(extra);
        },
        
        handlers: Fun.constant({
          'alloy.custom.test.event': EventHandler.nu({
            run: function (component) {
              store.adder('behaviour.b.event')();
            }
          })
        }),
        apis: Fun.constant({ 
          'behave': store.adder('behaviour.b.apis.behave'),
          'behaveB': store.adder('behaviour.b.apis.behaveB')
        }),
        schema: Fun.constant(
          ValueSchema.objOf([
            FieldSchema.strict('attr')
          ])
        )
      });

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'custom-component-test']
        },
        uid: 'custom-uid',
        behaviours: [
          behaviourA,
          behaviourB
        ],
        'behaviourA': { },
        'behaviourB': {
          attr: 'exhibition'
        },
        apiOrder: {
          'behave': [ 'behaviourB', 'behaviourA' ]
        },

        eventOrder: {
          'alloy.custom.test.event': [ 'behaviourA', 'behaviourB' ]
        },
        components: [
          { uiType: 'custom', uid: 'custom-uid-2', dom: { tag: 'div' } }
        ]
      });

    }, function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure(
          'Checking initial DOM modification',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              classes: [ arr.has('behaviour-a-exhibit') ],
              attrs: {
                'behaviour-b-exhibit': str.is('exhibition'),
                'alloy-id': str.is('custom-uid')
              }
            });
          }),
          component.element()
        ),

        store.sAssertEq('Nothing in store yet', [ ]),

        Step.sync(function () {
          component.apis().behave();
        }),

        store.sAssertEq('Should now have a behaviour.a and behaviour.b log with b first', [
          'behaviour.b.apis.behave',
          'behaviour.a.apis.behave'
        ]),

        store.sClear,

        Step.sync(function () {
          component.apis().behaveA();
        }),

        store.sAssertEq('Should now have a behaviour.a and behaviour.b log', [
          'behaviour.a.apis.behaveA'
        ]),

        store.sClear,

        Step.sync(function () {
          component.apis().behaveB();
        }),

        store.sAssertEq('Should now have a behaviour.a and behaviour.b log', [
          'behaviour.b.apis.behaveB'
        ]),

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

        store.sClear,
        Logger.t(
          'Checking calling an API on a component retrieved by uid',
          Step.sync(function () {
            var comp = gui.getByUid('custom-uid').getOrDie();
            comp.apis().behave();
          })
        ),

        store.sAssertEq('Should now have a behaviour.a and behaviour.b log with b first', [
          'behaviour.b.apis.behave',
          'behaviour.a.apis.behave'
        ])
      ];
    }, success, failure);
 

  }
);