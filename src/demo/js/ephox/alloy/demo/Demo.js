define(
  'ephox.alloy.demo.Demo',

  [
    'ephox.alloy.api.Gui',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, Class, Element, Insert, document) {
    return function () {
      console.log('Loading demo');

      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());
    };
  }
);

