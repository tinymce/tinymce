define(
  'ephox.alloy.ui.single.MenuSpec',

  [
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.build.ItemType',
    'ephox.alloy.menu.build.SeparatorType',
    'ephox.alloy.menu.build.WidgetType',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuEvents',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'global!Error'
  ],

  function (Highlighting, EventHandler, ItemType, SeparatorType, WidgetType, ItemEvents, MenuEvents, Tagger, UiSubstitutes, Objects, ValueSchema, Arr, Merger, Fun, Option, Error) {
    var itemSchema = ValueSchema.choose(
      'type',
      {
        widget: WidgetType,
        item: ItemType,
        separator: SeparatorType
      }
    );

    var make = function (detail, spec) {
      var builtItems = Arr.map(detail.items(), function (i) {
        var munged = detail.members().item().munge(i);
        var fallbackUid = Tagger.generate('');
        var merged = Merger.deepMerge({
          uid: fallbackUid
        }, i, munged, {
          ignoreFocus: detail.fakeFocus()
        });

        var itemInfo = ValueSchema.asStructOrDie('menu.spec item', itemSchema, merged);

        return itemInfo.builder()(itemInfo);
      });

      var placeholders = {
        '<alloy.menu.items>': UiSubstitutes.multiple(true, function () {
          return builtItems;
        })
      };
      
      var components = detail.shell() ? builtItems : UiSubstitutes.substitutePlaces(Option.none(), detail, detail.components(), placeholders, { });

      return Merger.deepMerge(
        spec,
        {
          dom: Merger.deepMerge(
            detail.dom(),
            {
              attributes: {
                role: 'menu'
              }
            }
          ),
          uid: detail.uid(),

          behaviours: {
            highlighting: {
              // Highlighting for a menu is selecting items inside the menu
              highlightClass: detail.markers().selectedItem(),
              itemClass: detail.markers().item(),
              onHighlight: detail.onHighlight()
            },
            representing: {
              initialValue: detail.value()
            },

            composing: {
              find: Fun.identity
            },

            keying: detail.movement().config()(detail, detail.movement())
          },
          events: Objects.wrapAll([
            { 
              // This is dispatched from a menu to tell an item to be highlighted.
              key: ItemEvents.focus(),
              value: EventHandler.nu({
                run: function (menu, simulatedEvent) {
                  // Highlight the item
                  var event = simulatedEvent.event();
                  menu.getSystem().getByDom(event.target()).each(function (item) {
                    Highlighting.highlight(menu, item);

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
            },

            {
              key: ItemEvents.hover(),
              value: EventHandler.nu({
                // Highlight the item that the cursor is over. The onHighlight
                // code needs to handle updating focus if required
                run: function (menu, simulatedEvent) {
                  var item = simulatedEvent.event().item();
                  Highlighting.highlight(menu, item);
                }
              })
            }
          ]),
          components: components
        }
      );
    };

    return {
      make: make
    };
  }
);