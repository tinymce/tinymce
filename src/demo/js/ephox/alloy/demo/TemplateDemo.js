define(
  'ephox.alloy.demo.TemplateDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/dummy.html'
  ],

  function (Gui, GuiTemplate, HtmlDisplay, Class, Element, Insert, document, Template) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var subject = HtmlDisplay.section(
        gui,
        'This shows a template created by a normal DOM modification',
        GuiTemplate.use(
          Template,
          {
            uiType: 'dummy'
          },
          {
            fields: {
              'template-class': 'demo-template-dummy'
            },
            components: { }
          }
        )
      );
    };
  }
);