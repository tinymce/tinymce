asynctest(
  'ExecutingKeyingTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, EventHandler, GuiSetup) {
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
        keying: {
          mode: 'execution'
        },
        components: [
          
        ],
        focusing: true,
        events: {
          'alloy.execute': EventHandler.nu({
            run: store.adder('event.execute')
          })
        }
      });

    }, function (doc, body, gui, component, store) {
      return [
        Step.sync(function () {
          component.apis().focus();
        }),
        store.sAssertEq('Initially empty', [ ]),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Post enter', [ 'event.execute' ])
      ];
    }, function () { success(); }, failure);

  }
);