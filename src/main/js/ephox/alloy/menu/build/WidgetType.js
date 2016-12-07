define(
  'ephox.alloy.menu.build.WidgetType',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
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

  function (EditableFields, SystemEvents, Focusing, Keying, EventHandler, ItemEvents, MenuMarkers, UiSubstitutes, FieldPresence, FieldSchema, Objects, Merger, Option, Traverse) {
    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('data'),
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
        '<alloy.item.widget>': UiSubstitutes.single(true,  Merger.deepMerge(
          { uid: widgetUid },
          info.widget(),
          {
            representing: {
              query: function (component) {
                return info.data();
              },
              set: function () { }
            }
          }
        ))
      };

      var components = UiSubstitutes.substitutePlaces(Option.some('item-widget'), info, info.components(), placeholders);

      var focusWidget = function (component) {
        return component.getSystem().getByUid(widgetUid).map(function (widget) {
          Keying.focusIn(widget);
          return widget;
        });
      };

      var onHorizontalArrow = function (component, simulatedEvent) {
        return EditableFields.inside(simulatedEvent.event().target()) ? Option.none() : Option.some(true);
      };

      return Merger.deepMerge(info.base(), {
        uiType: 'custom',
        dom: info.dom(),
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
          },
          {
            key: SystemEvents.focusItem(),
            value: EventHandler.nu({
              run: function (component, simulatedEvent) {
                if (info.autofocus()) focusWidget(component);
                else Focusing.focus(component);
              }
            })
          }
        ]),
        behaviours: {
          representing: {
            initialValue: info.data()
          },
          focusing: {
            onFocus: function (component) {
              ItemEvents.onFocus(component);
            }
          },
          keying: {
            mode: 'special',
            // FIX: usage of undefined.
            // focusIn: info.autofocus() ? function (component) {
            //   focusWidget(component);
            // } : undefined,
            onLeft: onHorizontalArrow,
            onRight: onHorizontalArrow,
            onEscape: function (component, simulatedEvent) {
              // If the outer list item didn't have focus, 
              // then focus it (i.e. escape the inner widget). Only do if not autofocusing
              // Autofocusing should treat the widget like it is the only item, so it should
              // let its outer menu handle escape
              if (! Focusing.isFocused(component) && !info.autofocus()) {
                Focusing.focus(component);
                return Option.some(true);
              } else if (info.autofocus()) {
                simulatedEvent.setSource(component.element());
                return Option.none();
              } else {
                return Option.none();
              }
            }
          }
        }
      });
    };

    return schema;
  }
);