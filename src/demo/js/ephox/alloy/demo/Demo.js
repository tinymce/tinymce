define(
  'ephox.alloy.demo.Demo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, GuiFactory, Class, Element, Insert, document) {
    return function () {
      console.log('Loading demo');

      var gui = Gui.create();
      var doc = Element.fromDom(document);
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var button = GuiFactory.build({
        uiType: 'button',
        action: function () {
          console.log('***button.click');
        },
        text: 'Click me'
      });

      gui.add(button);


    };
  }
);

