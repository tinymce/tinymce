asynctest(
  'SandboxingTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.sandbox.Manager',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.knoch.future.CachedFuture',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],
 
  function (Assertions, Logger, Step, UiFinder, GuiFactory, Manager, GuiSetup, Sinks, CachedFuture, Future, Fun, Attr, Element, Insert, Remove) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return Sinks.fixedSink();
    }, function (doc, body, gui, sink, store) {
      var sandbox = sink.getSystem().build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'test-sandbox' ]
        },
        uid: 'no-duplicates',
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
              Attr.set(input, 'data-test-input', data);
              Insert.append(sandbox.element(), input);
              return input;
            },
            isPartOf: Fun.constant(false)

          })
        }
      });
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
        // It is not in the DOM until it opens
        UiFinder.sNotExists(gui.element(), '.test-sandbox'),

        Step.sync(function () {
          Assertions.assertEq(
            'Sandbox should not be showing yet',
            false,
            sandbox.apis().isShowing()
          );
        }),

        Logger.t(
          'Show the sandbox with data: first-showing',
          Step.async(function (next, die) {
            sandbox.apis().showSandbox(
              CachedFuture.pure('first-showing')
            ).get(function () {
              next();
            });
          })
        ),

        Step.sync(function () {
          Assertions.assertEq(
            'Sandbox should now be showing',
            true,
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