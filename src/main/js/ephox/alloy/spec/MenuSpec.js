define(
  'ephox.alloy.spec.MenuSpec',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.build.ItemType',
    'ephox.alloy.menu.build.SeparatorType',
    'ephox.alloy.menu.build.WidgetType',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuEvents',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (EventHandler, ItemType, SeparatorType, WidgetType, ItemEvents, MenuEvents, MenuMarkers, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun) {
    var itemSchema = ValueSchema.choose(
      'type',
      {
        widget: WidgetType,
        item: ItemType,
        separator: SeparatorType
      }
    );

    var menuSchema = ValueSchema.objOf([
      FieldSchema.strict('value'),
      FieldSchema.strict('items'),
      FieldSchema.defaulted('classes', [ 'alloy-menu' ]),
      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.defaulted(MenuMarkers.fallback()),
        MenuMarkers.schema()
      )
    ]);

    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('menu.spec', menuSchema, spec);
      return {
        uiType: 'custom',
        dom: {
          tag: 'ol',
          classes: detail.classes(),
          attributes: Objects.wrapAll([
            {
              key: detail.markers().menuValue(),
              value: detail.value()
            }
          ])
        },
        highlighting: {
          // Highlighting for a menu is selecting items inside the menu
          highlightClass: detail.markers().selectedItem(),
          itemClass: detail.markers().item()
        },
        events: Objects.wrapAll([
          { 
            key: ItemEvents.focus(),
            value: EventHandler.nu({
              run: function (menu, simulatedEvent) {
                // Highlight the item
                var event = simulatedEvent.event();
                var item = event.target();
                menu.apis().highlight(item);

                simulatedEvent.stop();

                // Trigger the focus event on the menu.
                var focusTarget = menu.element();
                menu.getSystem().triggerEvent(MenuEvents.focus(), focusTarget, {
                  target: Fun.constant(focusTarget),
                  menu: Fun.constant(menu),
                  item: simulatedEvent.event().item
                });
              }
            })
          }
        ]),
        components: Arr.map(detail.items(), function (i) {
          var markers = {
            item: detail.markers().item(),
            itemValue: detail.markers().itemValue(),
            itemText: detail.markers().itemText(),
            selectedItem: detail.markers().selectedItem()
          };

          var merged = Merger.deepMerge(i, {
            markers: markers
          });
          var itemInfo = ValueSchema.asStructOrDie('menu.spec item', itemSchema, merged);
          return itemInfo.builder()(itemInfo);
        })
      };
    };

    return {
      schema: Fun.constant(menuSchema),
      make: make
    };
  }
);