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
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (EventHandler, ItemType, SeparatorType, WidgetType, ItemEvents, MenuEvents, MenuMarkers, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Json, Fun, Error) {
    var itemSchema = ValueSchema.choose(
      'type',
      {
        widget: WidgetType,
        item: ItemType,
        separator: SeparatorType
      }
    );

    var menuSchema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('items'),
      FieldSchema.strict('dom'),
      FieldSchema.strict('components'),
      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.schema()
      ),
      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('item')
        ])
      )
    ];

    var placeholder = function (label, replacements) {
      var called = false;

      var used = function () {
        return called;
      };

      var replace = function () {
        if (called === true) throw new Error(
          'Trying to use the same placeholder more than once: ' + label
        );
        called = true;
        return replacements;
      };

      return {
        name: Fun.constant(label),
        used: used,
        replace: replace
      };
    };

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('menu.spec', menuSchema, spec);

      var builtItems = Arr.map(detail.items(), function (i) {
        var munged = detail.members().item().munge(i);
        var merged = Merger.deepMerge(i, munged);

        var itemInfo = ValueSchema.asStructOrDie('menu.spec item', itemSchema, merged);

        return itemInfo.builder()(itemInfo);
      });

      var placeholders = {
        '<alloy.menu.items>': placeholder(
          'alloy.menu.items',
          UiSubstitutes.multiple(builtItems)
        )
      };

      
      var components = UiSubstitutes.substituteAll(detail, detail.components(), { }, placeholders);

      Obj.each(placeholders, function (p) {
        if (p.used() === false) throw new Error(
          'Placeholder: ' + p.name() + ' was not found in components list\nComponents: ' +
          Json.stringify(detail.components(), null, 2)
        );
      });

      return {
        uiType: 'custom',
        dom: detail.dom(),
        uid: detail.uid(),
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
                menu.getSystem().getByDom(event.target()).each(function (item) {
                  menu.apis().highlight(item);

                  simulatedEvent.stop();

                  // Trigger the focus event on the menu.
                  var focusTarget = menu.element();
                  menu.getSystem().triggerEvent(MenuEvents.focus(), focusTarget, {
                    target: Fun.constant(focusTarget),
                    menu: Fun.constant(menu),
                    item: item
                  });
                });
              }
            })
          }
        ]),
        representing: {
          query: function () {
            return detail.value();
          },
          set: function () { }
        },
        components: components
      };
    };

    return {
      schema: Fun.constant(menuSchema),
      make: make
    };
  }
);