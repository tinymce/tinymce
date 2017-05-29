define(
  'ephox.alloy.menu.build.WidgetType',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.build.WidgetParts',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.parts.AlloyParts',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option'
  ],

  function (
    EditableFields, Behaviour, Focusing, Keying, Representing, AlloyEvents, NativeEvents, SystemEvents, Fields, WidgetParts, ItemEvents, AlloyParts, FieldSchema,
    Merger, Option
  ) {
    var builder = function (info) {
      var subs = AlloyParts.substitutes(WidgetParts.owner(), info, WidgetParts.parts());
      var components = AlloyParts.components(WidgetParts.owner(), info, subs.internals());

      var focusWidget = function (component) {
        return AlloyParts.getPart(component, info, 'widget').map(function (widget) {
          Keying.focusIn(widget);
          return widget;
        });
      };

      var onHorizontalArrow = function (component, simulatedEvent) {
        return EditableFields.inside(simulatedEvent.event().target()) ? Option.none() : (function () {
          if (info.autofocus()) {
            simulatedEvent.setSource(component.element());
            return Option.none();
          } else {
            return Option.none();
          }
        })();
      };

      return Merger.deepMerge({
        dom: info.dom(),
        components: components,
        domModification: info.domModification(),
        events: AlloyEvents.derive([
          AlloyEvents.runOnExecute(function (component, simulatedEvent) {
            focusWidget(component).each(function (widget) {
              simulatedEvent.stop();
            });
          }),

          AlloyEvents.run(NativeEvents.mouseover(), ItemEvents.onHover),

          AlloyEvents.run(SystemEvents.focusItem(), function (component, simulatedEvent) {
            if (info.autofocus()) focusWidget(component);
            else Focusing.focus(component);
          })
        ]),
        behaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'memory',
              initialValue: info.data()
            }
          }),
          Focusing.config({
            onFocus: function (component) {
              ItemEvents.onFocus(component);
            }
          }),
          Keying.config({
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
          })
        ])
      });
    };

    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('data'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('autofocus', false),
      FieldSchema.defaulted('domModification', { }),
      // We don't have the uid at this point
      AlloyParts.defaultUidsSchema(WidgetParts.parts()),
      Fields.output('builder', builder)
    ];


    return schema;
  }
);