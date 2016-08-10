asynctest(
  'CustomComponentTest',
 
  [
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
 
  function (Step, GuiFactory, CustomBehaviour, EventHandler, DomModification, GuiSetup, FieldSchema, ValueSchema, Fun) {
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
          'lab.custom.test.event': EventHandler.nu({
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
          'lab.custom.test.event': EventHandler.nu({
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
        behaviours: [
          behaviourA,
          behaviourB
        ],
        'behaviourA': { },
        'behaviourB': {
          attr: 'exhibition'
        },
        apiOrder: {
          // 'behave': [ 'behaviourB', 'behaviourA' ]
        },

        eventOrder: {
          'lab.custom.test.event': [ 'behaviourA', 'behaviourB' ]
        }
      });

    }, function (doc, body, gui, component, store) {
      return [
        Step.debugging
      ]
    }, success, failure);
 

  }
);