asynctest(
  'SandboxingTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
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
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove'
  ],
 
  function (Assertions, GeneralSteps, Logger, Step, UiFinder, GuiFactory, Manager, GuiSetup, Sinks, CachedFuture, Future, Fun, Attr, Element, Insert, Node, Remove) {
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

      var sClose = Step.sync(function () {
        sandbox.apis().closeSandbox();
      });

      var sCheckShowing = function (label, expected) {
        return Step.sync(function () {
          Assertions.assertEq(
            label + '\nSandbox should ' + (expected === false ? '*not* ' : '') + 'be showing',
            expected,
            sandbox.apis().isShowing()
          );
        });
      };

      var sCheckOpenState = function (label, expected) {
        return Logger.t(
          label, 
          GeneralSteps.sequence([
            sCheckShowing(label, true),
            UiFinder.sExists(gui.element(), 'input[data-test-input="' + expected.data + '"]'),
            UiFinder.sExists(gui.element(), '.test-sandbox'),
            store.sAssertEq('Checking store', expected.store),
            store.sClear,
            Step.sync(function () {
              var state = sandbox.apis().getState();
              Assertions.assertEq(label + '\nChecking state node name', 'input', Node.name(state.getOrDie()));
            })
          ])
        );
      };

      var sCheckClosedState = function (label, expected) {
        return Logger.t(
          label,
          GeneralSteps.sequence([
            sCheckShowing(label, false),
            UiFinder.sNotExists(gui.element(), 'input[data-test-input]'),
            UiFinder.sNotExists(gui.element(), '.test-sandbox'),
            store.sAssertEq(label, expected.store),
            store.sClear,
            Step.sync(function () {
              var state = sandbox.apis().getState();
              Assertions.assertEq(label + '\nChecking state is not set', true, state.isNone());
            })
          ])
        );
      };

      return [
        // initially
        sCheckClosedState('Initial state', { store: [ ] }),

        // showing sandbox
        Logger.t('Show the sandbox with data: first-showing', sShowWith('first-showing')),
        sCheckOpenState('After showing', { data: 'first-showing', store: [ 'preview' ] }),

        // closing sandbox
        Logger.t('Closing sandbox', sClose),
        sCheckClosedState('After closing', { store: [ ] }),

        // opening sandbox
        Logger.t('Opening sandbox', sOpenWith('first-opening')),
        sCheckOpenState('Opening sandbox', { data: 'first-opening', store: [ 'enter' ] }),

        // opening sandbox again
        Logger.t('Opening sandbox while it is already open', sOpenWith('second-opening')),
        sCheckOpenState('Opening sandbox while it is already open', {
          data: 'second-opening',
          store: [ 'enter' ]
        }),

        // closing sandbox again
        Logger.t('Closing sandbox 2', sClose),
        sCheckClosedState('After closing 2', { store: [ ] }),

        // showing sandbox again
        Logger.t('Showing sandbox 2', sShowWith('second-showing')),
        sCheckOpenState('After showing 2', {
          data: 'second-showing',
          store: [ 'preview' ]
        }),

        // goto showing sandbox
        Logger.t('Goto sandbox', Step.sync(function () {
          sandbox.apis().gotoSandbox();
        })),
        sCheckOpenState('After goto sandbox', {
          data: 'second-showing',
          store: [ 'enter' ]
        }),

        // Close sandbox
        Logger.t('Closing sandbox 3', sClose),
        sCheckClosedState('After closing 3', { store: [ ] }),

        Logger.t('Goto closed sandbox', Step.sync(function () {
          sandbox.apis().gotoSandbox();
        })),
        sCheckClosedState('After goto closed sandbox', {
          store: [ ]
        })
      ];
    }, function () { success(); }, failure);

  }
);