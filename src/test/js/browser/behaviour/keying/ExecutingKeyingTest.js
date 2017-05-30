asynctest(
  'ExecutingKeyingTest',

  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.test.GuiSetup'
  ],

  function (Keyboard, Keys, Step, Behaviour, Focusing, Keying, GuiFactory, AlloyEvents, Container, GuiSetup) {
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
          containerBehaviours: Behaviour.derive([
            Focusing.config({ }),
            Keying.config({
              mode: 'execution'
            })
          ]),
          events: AlloyEvents.derive([
            AlloyEvents.runOnExecute(store.adder('event.execute'))
          ])
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