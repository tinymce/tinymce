define(
  'ephox.alloy.menu.build.ItemType',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, EventHandler, ItemEvents, MenuMarkers, FieldPresence, FieldSchema, Objects, Fun) {
    var schema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('text'),
      FieldSchema.option('html'),
      // Maybe flesh out the inners of markers
      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.itemSchema()
      ),
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
          classes: info.classes().concat([ info.markers().item() ]),
          attributes: Objects.wrapAll([
            {
              key: info.markers().itemValue(),
              value: info.value()
            },
            {
              key: info.markers().itemText(),
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