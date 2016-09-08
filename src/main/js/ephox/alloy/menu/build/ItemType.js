define(
  'ephox.alloy.menu.build.ItemType',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, EventHandler, ItemEvents, FieldSchema, Objects, Fun) {
    var schema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('text'),
      FieldSchema.option('html'),
      FieldSchema.strict('valueAttr'),
      FieldSchema.strict('textAttr'),
      FieldSchema.defaulted('classes', [ ]),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (info) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'li',
          classes: info.classes(),
          attributes: Objects.wrap([
            {
              key: info.valueAttr(),
              value: info.value()
            },
            {
              key: info.textAttr(),
              value: info.text()
            }
          ]),
          innerHtml: info.html().getOr(info.text())
        },
        focusing: {
          onFocus: function (component) {
            ItemEvents.onFocus(component);
          }
        },
        events: {
          'click': EventHandler.nu({
            run: function (component) {
              var target = component.element();
              component.getSystem().triggerEvent(SystemEvents.execute(), target, {
                target: Fun.constant(target)
              });
            }
          }),
          'mouseover': ItemEvents.hoverHandler
        },
        keying: {
          mode: 'execution'
        }
      };
    };

    return schema;
  }
);