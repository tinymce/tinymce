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

      var sShowWith = function (data) {
        return Step.async(function (next, die) {
          sandbox.apis().showSandbox(
            CachedFuture.pure(data)
          ).get(function () {
            next();
          });
        });
      };

      var sOpenWith = function (data) {
        return Step.async(function (next, die) {
          sandbox.apis().openSandbox(
            CachedFuture.pure(data)
          ).get(function () {
            next();
          });
        });
      };

      var sCheckShowing = function (label, expected) {
        return Step.sync(function () {
          Assertions.assertEq(
            label + '\nSandbox should ' + (expected === false ? '*not* ' : '') + 'be showing',
            expected,
            sandbox.apis().isShowing()
          );
        });
      };

      return [
        // initially
        UiFinder.sNotExists(gui.element(), 'input[data-test-input]'),
        UiFinder.sNotExists(gui.element(), '.test-sandbox'),
        sCheckShowing('Initially', false),

        // showing sandbox
        Logger.t(
          'Show the sandbox with data: first-showing',
          sShowWith('first-showing')
        ),
        sCheckShowing('After showing', true),
        UiFinder.sExists(gui.element(), 'input[data-test-input="first-showing"]'),
        store.sAssertEq('After show, preview should be in list', [ 'preview' ]),
        store.sClear,

        // closing sandbox
        Logger.t(
          'Closing sandbox',
          Step.sync(function () {
            sandbox.apis().closeSandbox();
          })
        ),

        store.sAssertEq('After close, nothing', [  ]),
        UiFinder.sNotExists(gui.element(), 'input[data-test-input]'),
        UiFinder.sNotExists(gui.element(), '.test-sandbox'),
        sCheckShowing('After closing', false),

        // opening sandbox
        Logger.t(
          'Opening sandbox',
          sOpenWith('first-opening')
        ),
        sCheckShowing('After opening', true),
        UiFinder.sExists(gui.element(), 'input[data-test-input="first-opening"]'),
        store.sAssertEq('After open, enter should be in list', [ 'enter' ]),
        store.sClear,

        // opening sandbox again
        Logger.t(
          'Opening sandbox while it is already open',
          sOpenWith('second-opening')
        ),
        sCheckShowing('After opening', true),
        UiFinder.sExists(gui.element(), 'input[data-test-input="second-opening"]'),
        store.sAssertEq('After open, enter should be in list', [ 'enter' ]),
        store.sClear
      ];
    }, function () { success(); }, failure);

  }
);