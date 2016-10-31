define(
  'ephox.alloy.demo.DialogDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'text!dom-templates/tinymce.dialog.html'
  ],

  function (Gui, GuiFactory, GuiTemplate, HtmlDisplay, Option, Class, Element, Insert, TemplateTinyDialog) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        positioning: {
          useFixed: true
        }
      });

      gui.add(sink);

      var dialog = HtmlDisplay.section(
        gui,
        'This dialog is customised',
        GuiTemplate.use(
          Option.some('modal-dialog'),
          TemplateTinyDialog,
          {
            uiType: 'modal-dialog'
          },
          {
            fields: { }
          }
        )
      );

      sink.apis().position({
        anchor: 'modal'
      }, dialog);
    };
  }
);