asynctest(
  'ExecutingKeyingTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, Focusing, Keying, EventHandler, GuiSetup, Objects) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'executing-keying-test'],
          styles: {
            
          }
        },
        uid: 'custom-uid',

        components: [
          
        ],
        behaviours: Objects.wrapAll([
          Focusing.config({ }),
          Keying.config({
            mode: 'execution'
          })
        ]),
        // {
        //   focusing: true,
        //   keying: {
        //     mode: 'execution'
        //   }
        // },
        events: {
          'alloy.execute': EventHandler.nu({
            run: store.adder('event.execute')
          })
        }
      });

    }, function (doc, body, gui, component, store) {
      return [
        GuiSetup.mSetupKeyLogger(body),
        Step.sync(function () {
          Focusing.focus(component);
        }),
        store.sAssertEq('Initially empty', [ ]),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Post enter', [ 'event.execute' ]),
        GuiSetup.mTeardownKeyLogger(body, [ ])
      ];
    }, function () { success(); }, failure);

  }
);