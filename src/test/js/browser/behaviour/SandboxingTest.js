asynctest(
  'SandboxingTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.sandbox.Manager',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],
 
  function (Assertions, Step, UiFinder, GuiFactory, Manager, GuiSetup, Sinks, Fun, Attr, Element, Insert, Remove) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.fixedSink();

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: [
          { built: sink },
          {
            uiType: 'custom',
            dom: {
              tag: 'div',
              classes: [ 'test-sandbox' ]
            },
            uid: 'subject-sandbox',
            sandboxing: {
              sink: sink,
              manager: Manager.contract({
                clear: function (sandbox) {
                  Remove.empty(sandbox.element());
                },
                enter: store.adder('enter'),
                preview: store.adder('preview'),
                populate: function (sandbox, data) {
                  var input = Element.fromTag('input');
                  Attr.set('data-test-input', 'true');
                  Insert.append(sandbox.element(), input);
                  return input;
                },
                isPartOf: Fun.constant(false)

              })
            }
          }
        ]
      });

    }, function (doc, body, gui, component, store) {
      var sandbox = gui.getByUid('subject-sandbox').getOrDie();

      /*
        Testing apis:
       
        openSandbox: Behaviour.tryActionOpt('sandboxing', info, 'openSandbox', openSandbox),
        closeSandbox: Behaviour.tryActionOpt('sandboxing', info, 'closeSandbox', closeSandbox),
        isShowing: Behaviour.tryActionOpt('sandboxing', info, 'isShowing', isShowing),
        isPartOf: Behaviour.tryActionOpt('sandboxing', info, 'isPartOf', isPartOf),
        showSandbox: Behaviour.tryActionOpt('sandboxing', info, 'showSandbox', showSandbox),
        gotoSandbox: Behaviour.tryActionOpt('sandboxing', info, 'gotoSandbox', gotoSandbox),
        getState: Behaviour.tryActionOpt('sandboxing', info, 'getState', getState)

      */
      return [
        UiFinder.sNotExists(gui.element(), 'input[data-test-input]'),
        // It exists straight away because we've added it.
        UiFinder.sExists(gui.element(), '.test-sandbox'),

        Step.sync(function () {
          Assertions.assertEq(
            'Sandbox should not be showing yet',
            false,
            sandbox.apis().isShowing()
          );
        }),
        Step.sync(function () {

        }),
        Step.debugging
      ];
    }, function () { success(); }, failure);

  }
);