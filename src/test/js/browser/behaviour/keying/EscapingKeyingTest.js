asynctest(
  'EscapingKeyingTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'escape-keying-test'],
          styles: {
            
          }
        },
        uid: 'custom-uid',
        keying: {
          mode: 'escaping',
          onEscape: store.adderH('detected.escape')
        },
        components: [
          
        ],
        focusing: true
      });

    }, function (doc, body, gui, component, store) {
      return [
        GuiSetup.mSetupKeyLogger(body),
        Step.sync(function () {
          component.apis().focus();
        }),
        store.sAssertEq('Initially empty', [ ]),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        store.sAssertEq('Post escape', [ 'detected.escape' ]),
        GuiSetup.mTeardownKeyLogger(body, [ ])
      ];
    }, function () { success(); }, failure);

  }
);