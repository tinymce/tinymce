asynctest(
  'SandboxingTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.boulder.api.Objects',
    'ephox.knoch.future.CachedFuture',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove'
  ],
 
  function (Assertions, Chain, GeneralSteps, Logger, Step, UiFinder, SystemEvents, Behaviour, Sandboxing, Container, Input, GuiSetup, Sinks, Objects, CachedFuture, Fun, Result, Attr, Element, Insert, Node, Remove) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return Sinks.fixedSink();
    }, function (doc, body, gui, sink, store) {
      var sandbox = sink.getSystem().build(
        Container.sketch({
          dom: {
            classes: [ 'test-sandbox' ]
          },
          uid: 'no-duplicates',
          behaviours: Behaviour.derive([
            Sandboxing.config({
              bucket: {
                mode: 'sink',
                lazySink: function () {
                  return Result.value(sink);
                }
              },

              onOpen: store.adder('onOpen'),
              onClose: store.adder('onClose'),

              isPartOf: Fun.constant(false)
            })
          ])
        })
      );
    
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
            label + '\nSandbox should ' + (expected === false ? '*not* ' : '') + 'be open',
            expected,
            Sandboxing.isOpen(sandbox)
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
              Assertions.assertEq(label + '\nChecking state node name', 'input', Node.name(state.getOrDie().element()));
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

      var makeData = function (rawData) {
        return Input.sketch({
          uid: rawData,
          dom: {
            attributes: {
              'data-test-input': rawData
            }
          }
        });
      };

      var firstOpening = makeData('first-opening');
      var secondOpening = makeData('second-opening');

      return [
        // initially
        sCheckClosedState('Initial state', { store: [ ] }),

        // // opening sandbox
        Logger.t('Opening sandbox', sOpenWith(firstOpening)),
        sCheckOpenState('Opening sandbox', { data: 'first-opening', store: [ 'onOpen' ] }),
     
        // // opening sandbox again
        Logger.t('Opening sandbox while it is already open', sOpenWith(secondOpening)),
        sCheckOpenState('Opening sandbox while it is already open', {
          data: 'second-opening',
          store: [ 'onOpen' ]
        }),

        // closing sandbox again
        Logger.t('Closing sandbox 2', sClose),
        sCheckClosedState('After closing 2', { store: [ 'onClose' ] }),

        Logger.t('Opening sandbox with a uid that has already been used: try and re-open firstOpening', sOpenWith(firstOpening)),
        sCheckOpenState('Opening sandbox with a uid that has already been used', {
          data: 'first-opening',
          store: [ 'onOpen' ]
        }),

        Logger.t(
          'Firing sandbox close system event',
          
          Chain.asStep({}, [
            Chain.inject(sandbox.element()),
            UiFinder.cFindIn('input'),
            Chain.op(function (input) {
              sandbox.getSystem().triggerEvent(SystemEvents.sandboxClose(), input, { });
            })
          ])
        ),

        sCheckClosedState('After sending system close event', { store: [ 'onClose' ] })
      ];
    }, function () { success(); }, failure);

  }
);