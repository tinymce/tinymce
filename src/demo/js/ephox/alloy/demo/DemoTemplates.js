define(
  'ephox.alloy.demo.DemoTemplates',

  [
    'ephox.alloy.api.GuiTemplate',
    'ephox.boulder.api.Objects',
    'ephox.perhaps.Option',
    'text!dom-templates/demo.menu.html',
    'text!dom-templates/demo.menu.item.html',
    'text!dom-templates/demo.menu.separator.html',
    'text!dom-templates/demo.menu.widget.item.html'
  ],

  function (GuiTemplate, Objects, Option, TemplateMenu, TemplateMenuItem, TemplateMenuSeparator, TemplateMenuWidgetItem) {
    var item = function (spec) {
      if (spec.type === 'widget') {
        return GuiTemplate.use(
          Option.some('item-widget'),
          TemplateMenuWidgetItem,
          { },
          {
            fields: {
              'widget-class': 'alloy-widget',
              text: 'widget-text'
            }
          }
        );
      } else if (spec.type === 'separator') {
        return GuiTemplate.use(
          Option.none(),
          TemplateMenuSeparator,
          { },
          {
            fields: {
              text: Objects.readOptFrom(spec, 'text').getOr('')
            }
          }
        );
      } else {
        return GuiTemplate.use(
          Option.some('item'),
          TemplateMenuItem,
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