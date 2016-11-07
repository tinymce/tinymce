define(
  'ephox.alloy.menu.widget.WidgetConfig',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.sandbox.Manager',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Insert'
  ],

  function (ComponentStructure, Keying, Positioning, Manager, FieldPresence, FieldSchema, ValueSchema, Merger, Option, Cell, Body, Insert) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('lazyHotspot'),

      FieldSchema.strict('onOpen'),
      FieldSchema.strict('onClose'),
      FieldSchema.strict('onExecute'),

      FieldSchema.strict('lazySink'),

      FieldSchema.strict('scaffold'),
      
      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('container')
        ])
      )
    ]);

    return function (rawUiSpec) {
      var uiSpec = ValueSchema.asStructOrDie('WidgetConfig', schema, rawUiSpec);

      var state = Cell(Option.none());

      var getSink = function () {
        return uiSpec.lazySink()().getOrDie();
      };

      var build = function (sandbox, data) {
        var containerSpec = Merger.deepMerge(
          uiSpec.members().container().munge(rawUiSpec),
          {
            // Always flatgrid.
            uiType: 'widget-container',
            widget: data
          }
        );

        var container = sandbox.getSystem().build(containerSpec);
        var scaffoldSpec = uiSpec.scaffold()({ built: container });
        var scaffold = scaffoldSpec !== container ? sandbox.getSystem().build(scaffoldSpec) : container;
        return {
          scaffold: scaffold,
          container: container
        };
      };

      var populate = function (sandbox, data) {
        var tuple = build(sandbox, data);
        sandbox.getSystem().addToWorld(tuple.scaffold);
        if (! Body.inBody(tuple.scaffold.element())) Insert.append(sandbox.element(), tuple.scaffold.element());
        state.set(Option.some(tuple));
        return state;
      };

      var show = function (sandbox, tuple) {
        var sink = getSink();
        Positioning.position(sink, {
          anchor: 'hotspot',
          hotspot: uiSpec.lazyHotspot()(),
          bubble: Option.none()
        }, tuple.scaffold);

        uiSpec.onOpen()(sandbox, tuple.container);
      };

      var enter = function (sandbox, state) {
        state.get().each(function (tuple) {
          show(sandbox, tuple);
          Keying.focusIn(tuple.container);
        });
      };

      var preview = function (sandbox, state) {
        state.get().each(function (tuple) {
          show(sandbox, tuple);
        });
      };

      var clear = function (sandbox, state) {
        state.get().each(function (tuple) {
          sandbox.getSystem().removeFromWorld(tuple.scaffold);
        });
        state.set(Option.none());
      };

      var isPartOf = function (sandbox, state, queryElem) {
        return state.get().exists(function (tuple) {
          return ComponentStructure.isPartOf(tuple.scaffold, queryElem);
        });
      };

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
          lazySink: uiSpec.lazySink()
        }
      };
    };
  }
);