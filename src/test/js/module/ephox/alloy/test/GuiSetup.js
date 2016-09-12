define(
  'ephox.alloy.test.GuiSetup',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.Gui',
    'ephox.alloy.test.TestStore',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'global!document'
  ],

  function (Assertions, Pipeline, Step, Gui, TestStore, DomEvent, Element, Insert, Remove, document) {
    var setup = function (createComponent, f, success, failure) {
      var store = TestStore();

      var gui = Gui.create();

      var doc = Element.fromDom(document);
      var body = Element.fromDom(document.body);

      Insert.append(body, gui.element());

      var component = createComponent(store, doc, body);
      gui.add(component);

      Pipeline.async({}, f(doc, body, gui, component, store), function () {
        Remove.remove(gui.element());
        success();
      }, failure);
    };

    var mSetupKeyLogger = function (body) {
      return Step.stateful(function (_, next, die) {
        var onKeydown = DomEvent.bind(body, 'keydown', function (event) {
          newState.log.push('keydown.to.body: ' + event.raw().which);
        });

        var log = [ ];
        var newState = {
          log: log,
          onKeydown: onKeydown
        };
        next(newState);
      });
    };

    var mTeardownKeyLogger = function (body, expected) {
      return Step.stateful(function (state, next, die) {
        Assertions.assertEq('Checking key log outside context', expected, state.log);
        state.onKeydown.unbind();
        next({});
      });
    };

    return {
      setup: setup,
      mSetupKeyLogger: mSetupKeyLogger,
      mTeardownKeyLogger: mTeardownKeyLogger
    };
  }
);