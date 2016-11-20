define(
  'ephox.alloy.inline.spi.InlineConfig',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.inline.state.InlineState',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.alloy.sandbox.Manager',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],

  function (ComponentStructure, Keying, Positioning, InlineState, Dismissal, Manager, FieldSchema, ValueSchema, Fun, Insert, Remove) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('anchorage'),
      FieldSchema.defaulted('onClose', Fun.noop),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.strict('lazySink')
    ]);

    return function (rawUiSpec) {
      var uiSpec = ValueSchema.asStructOrDie('InlineConfig', schema, rawUiSpec);

      var getSink = function () {
        return uiSpec.lazySink()().getOrDie();
      };

      var populate = function (sandbox, buildSpec) {

        var state = InlineState();
        Remove.empty(sandbox.element()); 
        var built = sandbox.getSystem().build(buildSpec);
        Insert.append(sandbox.element(), built.element());
        sandbox.getSystem().addToWorld(built);
        state.set(built);
        return state;
      };

      var clear = function (sandbox, state) {
        state.get().each(function (built) {
          sandbox.getSystem().removeFromWorld(built);
        });

        Remove.empty(sandbox.element());
      };

      var isPartOf = function (sandbox, state, queryElem) {
        return state.get().exists(function (built) {
          return ComponentStructure.isPartOf(built, queryElem);
        });
      };

      var show = function (sandbox, component) {
        var anchor = uiSpec.anchorage().get(sandbox, component);
        Positioning.position(getSink(), anchor, sandbox);
        uiSpec.onOpen()(sandbox, component);
      };

      var enter = function (sandbox, state) {
        state.get().each(function (built) {
          show(sandbox, built);
          Keying.focusIn(sandbox);
        });
      };

      var preview = function (sandbox, state) {
        state.get().each(function (built) {
          show(sandbox, built);
        });
      };

      var setAnchor = function (sandbox, newAnchor) {
        uiSpec.anchorage().set(newAnchor);
      };

      var receiving = Dismissal.receiving({ });

      return {
        sandboxing: {
          manager: Manager.contract({
            clear: clear,
            isPartOf: isPartOf,
            populate: populate,
            preview: preview,
            enter: enter
          }),
          lazySink: uiSpec.lazySink(),
          onClose: uiSpec.onClose()
        },
        receiving: receiving,
        apis: {
          setAnchor: setAnchor
        }
      };
    };
  }
);