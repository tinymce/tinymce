define(
  'ephox.alloy.demo.TemplateDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/demo.help'
  ],

  function (Gui, HtmlDisplay, Class, Element, Insert, document, template_pastryButton) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var subject = HtmlDisplay.section(
        gui,
        'This shows a template created by a normal DOM modification',
        {
          uiType: 'custom',
          template: {
            format: 'html',
            html: template_pastryButton,
            replacements: {
              'aria-label': 'Dog',
              title: 'Title caption'
            }
          }
        }
      );
    };
  }
);