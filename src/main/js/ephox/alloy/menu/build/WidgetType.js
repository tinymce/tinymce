define(
  'ephox.alloy.menu.build.WidgetType',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Merger',
    'ephox.perhaps.Option'
  ],

  function (EditableFields, SystemEvents, Focusing, Keying, EventHandler, ItemEvents, UiSubstitutes, FieldSchema, Objects, Merger, Option) {
    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('data'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
      FieldSchema.strict('widget'),
      FieldSchema.defaulted('autofocus', false),
      FieldSchema.defaulted('domModification', { }),
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
        '<alloy.item.widget>': UiSubstitutes.single(true, function () {
          return Merger.deepMerge(
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
          );
        })
      };

      var components = UiSubstitutes.substitutePlaces(Option.some('item-widget'), info, info.components(), placeholders);

      var focusWidget = function (component) {
        return component.getSystem().getByUid(widgetUid).map(function (widget) {
          Keying.focusIn(widget);
          return widget;
        });
      };

      var onHorizontalArrow = function (component, simulatedEvent) {
        return EditableFields.inside(simulatedEvent.event().target()) ? Option.none() : (function () {
          if (info.autofocus()) {
            simulatedEvent.setSource(component);
            return Option.none();
          }
        });
      };

      return Merger.deepMerge({
        dom: info.dom(),
        components: components,
        domModification: info.domModification(),
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
            store: {
              mode: 'memory',
              initialValue: info.data()
            }
          },
          focusing: {
            onFocus: function (component) {
              ItemEvents.onFocus(component);
            }
          },
          keying: {
            mode: 'special',
            // focusIn: info.autofocus() ? function (component) {
            //   focusWidget(component);
            // } : Behaviour.revoke(),
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