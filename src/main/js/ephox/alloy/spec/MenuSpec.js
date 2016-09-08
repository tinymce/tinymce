define(
  'ephox.alloy.spec.MenuSpec',

  [
    'ephox.alloy.menu.build.ItemType',
    'ephox.alloy.menu.build.SeparatorType',
    'ephox.alloy.menu.build.WidgetType',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema'
  ],

  function (ItemType, SeparatorType, WidgetType, FieldSchema, ValueSchema) {
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
      FieldSchema.strict('items')
    ]);

    return function (rawSpec) {
      var spec = ValueSchema.asStructOrDie('menu.spec', menuSchema, rawSpec);

      return {
        uiType: 'custom',
        dom: {
          tag: 'ol',
          classes: [
            'lab-menu'
          ],
          attributes: {
            'data-menu-value': spec.value()
          }
        },
        behaviours: [
          // Highlighting for a menu is selecting items inside the menu
          Highlighting
        ],
        highlighting: {
          highlightClass: 'selected',
          itemClass: 'lab-item-type'
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
        components: Arr.map(spec.items(), function (i) {
          var itemInfo = ValueSchema.asStructOrDie('deciphering item', itemSchema, i);
          return itemInfo.builder()(itemInfo);
        })
      };
    return null;
  }
);