asynctest(
  'ExecutingKeyingTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, Behaviour, Focusing, Keying, Container, EventHandler, GuiSetup, Objects) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Container.sketch({
          dom: {
            classes: [ 'executing-keying-test'],
            styles: {
              
            }
          },
          uid: 'custom-uid',

          components: [
            
          ],
          behaviours: Behaviour.derive([
            Focusing.config({ }),
            Keying.config({
              mode: 'execution'
            })
          ]),
          events: {
            'alloy.execute': EventHandler.nu({
              run: store.adder('event.execute')
            })
          }
        })
      );

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