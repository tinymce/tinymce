define(
  'ephox.alloy.menu.build.ItemType',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (SystemEvents, Behaviour, EventHandler, ItemEvents, MenuMarkers, FieldPresence, FieldSchema, Objects, Merger, Fun) {
    var schema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('text'),
      FieldSchema.strict('dom'),
      FieldSchema.option('html'),
      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.itemSchema()
      ),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (info) {
      return {
        uiType: 'custom',
        dom: info.dom(),
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
        },
        behaviours: [
          Behaviour.exhibition('exhibition.menu.item.type', {
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
            innerHtml: info.html().getOr(info.text()),
            classes: [ info.markers().item() ]
          })
        ]
      };
    };

    return schema;
  }
);