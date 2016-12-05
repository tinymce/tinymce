asynctest(
  'SandboxingTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.knoch.future.CachedFuture',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove'
  ],
 
  function (Assertions, GeneralSteps, Logger, Step, UiFinder, Sandboxing, GuiSetup, Sinks, CachedFuture, Fun, Result, Attr, Element, Insert, Node, Remove) {
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
        behaviours: {
          sandboxing: {
            bucket: {
              mode: 'sink',
              lazySink: function () {
                return Result.value(sink);
              }
            },

            onOpen: store.adder('onOpen'),
            onClose: store.adder('onClose'),


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
          }
        }
      });
      
      var sShowWith = function (data) {
        return Step.async(function (next, die) {
          Sandboxing.show(
            sandbox,
            CachedFuture.pure(data)
          ).get(function () {
            next();
          });
        });
      };

      var sOpenWith = function (data) {
        return Step.async(function (next, die) {
          Sandboxing.open(sandbox, CachedFuture.pure(data)).get(function () {
            next();
          });
        });
      };

      var sClose = Step.sync(function () {
        Sandboxing.close(sandbox);
      });

      var sCheckShowing = function (label, expected) {
        return Step.sync(function () {
          Assertions.assertEq(
            label + '\nSandbox should ' + (expected === false ? '*not* ' : '') + 'be showing',
            expected,
            Sandboxing.isShowing(sandbox)
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
              var state = Sandboxing.getState(sandbox);
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
              var state = Sandboxing.getState(sandbox);
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
        sCheckOpenState('After showing', { data: 'first-showing', store: [ 'preview', 'onOpen' ] }),

        // // closing sandbox
        Logger.t('Closing sandbox', sClose),
        sCheckClosedState('After closing', { store: [ 'onClose' ] }),

        // // opening sandbox
        Logger.t('Opening sandbox', sOpenWith('first-opening')),
        sCheckOpenState('Opening sandbox', { data: 'first-opening', store: [ 'enter', 'onOpen' ] }),
     
        // // opening sandbox again
        Logger.t('Opening sandbox while it is already open', sOpenWith('second-opening')),
        sCheckOpenState('Opening sandbox while it is already open', {
          data: 'second-opening',
          store: [ 'enter', 'onOpen' ]
        }),

        // closing sandbox again
        Logger.t('Closing sandbox 2', sClose),
        sCheckClosedState('After closing 2', { store: [ 'onClose' ] }),

        // showing sandbox again
        Logger.t('Showing sandbox 2', sShowWith('second-showing')),
        sCheckOpenState('After showing 2', {
          data: 'second-showing',
          store: [ 'preview', 'onOpen' ]
        }),

        // goto showing sandbox
        Logger.t('Goto sandbox', Step.sync(function () {
          Sandboxing.focusIn(sandbox);
        })),
        sCheckOpenState('After goto sandbox', {
          data: 'second-showing',
          store: [ 'enter'  ]
        }),

        // Close sandbox
        Logger.t('Closing sandbox 3', sClose),
        sCheckClosedState('After closing 3', { store: [ 'onClose' ] }),

        Logger.t('Goto closed sandbox', Step.sync(function () {
          Sandboxing.focusIn(sandbox);
        })),
        sCheckClosedState('After goto closed sandbox', {
          store: [ ]
        }),

        Step.fail('dog')
      ];
    }, function () { success(); }, failure);

  }
);