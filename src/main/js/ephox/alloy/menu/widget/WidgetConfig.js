define(
  'ephox.alloy.menu.widget.WidgetConfig',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.alloy.sandbox.Manager',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Insert'
  ],

  function (ComponentStructure, SystemEvents, EventHandler, MenuMarkers, Manager, FieldPresence, FieldSchema, Objects, ValueSchema, Merger, Option, Cell, Body, Insert) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('lazyHotspot'),

      FieldSchema.strict('onOpen'),
      FieldSchema.strict('onClose'),
      FieldSchema.strict('onExecute'),

      FieldSchema.strict('sink'),
      
      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('container'),
          FieldSchema.strict('widget')
        ])
      )
    ]);

    return function (rawUiSpec) {
      var uiSpec = ValueSchema.asStructOrDie('WidgetConfig', schema, rawUiSpec);

      var state = Cell(Option.none());

      var build = function (sandbox, data) {
        var container = Merger.deepMerge(
          uiSpec.members().container().munge(rawUiSpec),
          {
            // Always flatgrid.
            uiType: 'widget-container',
            widget: uiSpec.members().widget().munge(data)
          }
        );

        return sandbox.getSystem().build(container);
      };

      var populate = function (sandbox, data) {
        var container = build(sandbox, data);
        sandbox.getSystem().addToWorld(container);
        if (! Body.inBody(container.element())) Insert.append(sandbox.element(), container.element());
        state.set(Option.some(container));
        return state;
      };

      var show = function (sandbox, container) {
        uiSpec.sink().apis().position({
          anchor: 'hotspot',
          hotspot: uiSpec.lazyHotspot()(),
          bubble: Option.none()
        }, container);

        uiSpec.onOpen()(sandbox, container);
      };

      var enter = function (sandbox, state) {
        state.get().each(function (container) {
          show(sandbox, container);
          sandbox.apis().focusIn();
        });
      };

      var preview = function (sandbox, state) {
        state.get().each(function (container) {
          show(sandbox, container);
        });
      };

      var clear = function (sandbox, state) {
        state.get().each(function (container) {
          sandbox.getSystem().removeFromWorld(container);
        });
        state.set(Option.none());
      };

      var isPartOf = function (sandbox, state, queryElem) {
        return state.get().exists(function (container) {
          return ComponentStructure.isPartOf(container, queryElem);
        });
      };

      var events = Objects.wrapAll([
        {
          key: SystemEvents.execute(),
          value: EventHandler.nu({
            run: function (sandbox, simulatedEvent) {
              // Trigger on execute on the targeted element
              // I.e. clicking on menu item
              var target = simulatedEvent.event().target();
              return sandbox.getSystem().getByDom(target).bind(function (item) {
                return uiSpec.onExecute()(sandbox, item);
              });
            }
          })
        }
      ]);

      return {
        sandboxing: {
          manager: Manager.contract({
            clear: clear,
            isPartOf: isPartOf,
            populate: populate,
            preview: preview,
            enter: enter
          }),
          onClose: uiSpec.onClose(),
          sink: uiSpec.sink()
        },
        keying: {
          mode: 'special',
          onTab: function () { return Option.some(true); },
          onEscape: function (sandbox) {
            sandbox.apis().closeSandbox();
            uiSpec.lazyHotspot()().apis().focus();
            return Option.some(true);
          },
          focusIn: function (sandbox, sInfo) {
            return Option.none();
            // uiSpec.startFocus()(sandbox, sInfo);
          }
        },
        // maybe ESC and TAB handling?
        events: events
      };
    };
  }
);