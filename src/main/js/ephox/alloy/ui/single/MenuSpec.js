define(
  'ephox.alloy.ui.single.MenuSpec',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
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
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'global!Error'
  ],

  function (
    Behaviour, Composing, Highlighting, Keying, Representing, EventHandler, ItemType, SeparatorType, WidgetType, ItemEvents, MenuEvents, Tagger, UiSubstitutes,
    Objects, ValueSchema, Arr, Fun, Merger, Option, Error
  ) {
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
        var munged = detail.members().item().munge()(i);
        var fallbackUid = Tagger.generate('');
        var merged = Merger.deepMerge({
          uid: fallbackUid
        }, i, munged, {
          ignoreFocus: detail.fakeFocus(),
          domModification: {
            classes: [ detail.markers().item() ]
          }
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

          behaviours: Merger.deepMerge(
            Behaviour.derive([
              Highlighting.config({
                // Highlighting for a menu is selecting items inside the menu
                highlightClass: detail.markers().selectedItem(),
                itemClass: detail.markers().item(),
                onHighlight: detail.onHighlight()
              }),
              Representing.config({
                store: {
                  mode: 'memory',
                  initialValue: detail.value()
                }
              }),
              // FIX: Is this used? It has the wrong return type.
              Composing.config({
                find: Fun.identity
              }),
              Keying.config(detail.movement().config()(detail, detail.movement()))
            ]),
            detail.menuBehaviours()
          ),
          customBehaviours: detail.customBehaviours(),
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