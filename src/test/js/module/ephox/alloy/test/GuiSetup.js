define(
  'ephox.alloy.test.GuiSetup',

  [
    'ephox.agar.api.Pipeline',
    'ephox.alloy.api.Gui',
    'ephox.alloy.test.TestStore',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'global!document'
  ],

  function (Pipeline, Gui, TestStore, Element, Insert, Remove, document) {
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

    return {
      setup: setup
    };
  }
);