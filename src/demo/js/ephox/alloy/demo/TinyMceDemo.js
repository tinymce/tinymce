define(
  'ephox.alloy.demo.TinyMceDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/tinymce.toolbar.button',
    'text!dom-templates/tinymce.toolbar.group.2'
  ],

  function (Gui, GuiTemplate, HtmlDisplay, Class, Element, Insert, document, TemplateButton, TemplateGroup) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var subject = HtmlDisplay.section(
        gui,
        'This demo plays around with skinning for TinyMCE Ui',
        {
          uiType: 'custom',
          dom: {
            tag: 'div', 
            classes: [ 'mce-container' ]
          },
          components: [
            GuiTemplate.use(TemplateGroup, { uiType: 'custom' }, {
              fields: { },
              components: {
                buttons: [
                  GuiTemplate.use(TemplateButton, { uiType: 'custom' }, { }),
                  GuiTemplate.use(TemplateButton, { uiType: 'custom' }, { }),
                  GuiTemplate.use(TemplateButton, { uiType: 'custom' }, { }),
                  GuiTemplate.use(TemplateButton, { uiType: 'custom' }, { }),
                  GuiTemplate.use(TemplateButton, { uiType: 'custom' }, { })
                ]
              }
            })
            // GuiTemplate.use(TemplateGroup, { uiType: 'custom' }, { }),
            
          ]
        }
      );
    };
  }
);