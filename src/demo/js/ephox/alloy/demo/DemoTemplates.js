define(
  'ephox.alloy.demo.DemoTemplates',

  [
    'ephox.alloy.api.GuiTemplate',
    'text!dom-templates/demo.menu.html',
    'text!dom-templates/demo.menu.item.html',
    'text!dom-templates/demo.menu.separator.html',
    'text!dom-templates/demo.menu.widget.item.html'
  ],

  function (GuiTemplate, TemplateMenu, TemplateMenuItem, TemplateMenuSeparator, TemplateMenuWidgetItem) {
    var item = function (spec) {
      if (spec.type === 'widget') {
        return GuiTemplate.use(
          TemplateMenuWidgetItem,
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