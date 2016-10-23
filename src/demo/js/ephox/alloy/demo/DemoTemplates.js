define(
  'ephox.alloy.demo.DemoTemplates',

  [
    'ephox.alloy.api.GuiTemplate',
    'text!dom-templates/demo.menu.html',
    'text!dom-templates/demo.menu.item.html',
    'text!dom-templates/demo.menu.separator.html',
    'text!dom-templates/demo.menu.widget.html'
  ],

  function (GuiTemplate, TemplateMenu, TemplateMenuItem, TemplateMenuSeparator, TemplateMenuWidget) {
    var item = function (spec) {
      if (spec.type === 'widget') {
        return GuiTemplate.use(
          TemplateMenuWidget,
          { },
          {
            fields: {
              'widget-class': 'alloy-widget',
              text: 'widget-text'
            }
          }
        );
      } else {
        var template = spec.type === 'separator' ? TemplateMenuSeparator : TemplateMenuItem;
        return GuiTemplate.use(
          template,
          { }, {
            fields: spec
          }
        );
      }
    };

    return {
      item: item
    };
  }
);