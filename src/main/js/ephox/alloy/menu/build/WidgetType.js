define(
  'ephox.alloy.menu.build.WidgetType',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Traverse'
  ],

  function (SystemEvents, EventHandler, ItemEvents, MenuMarkers, UiSubstitutes, FieldPresence, FieldSchema, Objects, Merger, Option, Traverse) {
    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('value'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
      FieldSchema.strict('widget'),
      FieldSchema.defaulted('autofocus', false),
      FieldSchema.defaulted('base', { }),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (info) {
      var widgetUid = Objects.readOptFrom(
        info.widget(),
        'uid'
      ).getOr(info.uid() + '-widget');

      var placeholders = {
        '<alloy.item.widget>': UiSubstitutes.single(Merger.deepMerge(
          { uid: widgetUid },
          info.widget(),
          {
            representing: {
              query: function (component) {
                return info.value();
              },
              set: function () { }
            }
          }
        ))
      };

      var components = UiSubstitutes.substitutePlaces(info, info.components(), placeholders);

      var focusWidget = function (component) {
        return component.getSystem().getByUid(widgetUid).map(function (widget) {
          widget.apis().focusIn();
          return widget;
        });
      };

      return Merger.deepMerge(info.base(), {
        uiType: 'custom',
        dom: info.dom(),
        representing: {
          query: function () {
            return info.value();
          },
          // Not sure what to do about this.
          set: function () { }
        },
        components: components,
        events: Objects.wrapAll([
          {
            key: SystemEvents.execute(),
            value: EventHandler.nu({
              run: function (component, simulatedEvent) {
                focusWidget(component).each(function (widget) {
                  simulatedEvent.stop();
                });
              }
            })
          },
          {
            key: 'mouseover',
            value: ItemEvents.hoverHandler
          }

        ]),
        focusing: {
          onFocus: function (component) {
            ItemEvents.onFocus(component);
            if (info.autofocus()) {
              focusWidget(component);
            }
          }
        },
        keying: {
          mode: 'escaping',
          onEscape: function (component, simulatedEvent) {
            // If the outer list item didn't have focus, 
            // then focus it (i.e. escape the inner widget)
            if (!component.apis().isFocused()) {
              component.apis().focus();
              return Option.some(true);
            } else {
              return Option.none();
            }
          }
        }
      });
    };

    return schema;
  }
);