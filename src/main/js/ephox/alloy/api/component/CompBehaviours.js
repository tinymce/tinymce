define(
  'ephox.alloy.api.component.CompBehaviours',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Disabling',
    'ephox.alloy.api.behaviour.Docking',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Invalidating',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Pinching',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.behaviour.Streaming',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Transitioning',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.behaviour.common.BehaviourBlob',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'global!Error'
  ],

  function (
    Composing, Coupling, Disabling, Docking, Dragging, Focusing, Highlighting, Invalidating, Keying, Pinching, Positioning, Receiving, Replacing, Representing,
    Sandboxing, Sliding, Streaming, Tabstopping, Toggling, Transitioning, Unselecting, BehaviourBlob, Objects, Arr, Error
  ) {
    var alloyBehaviours = [
      Toggling,
      Composing,
      Coupling,
      Disabling,
      Docking,
      Dragging,
      Focusing,
      Highlighting,
      Invalidating,
      Keying,
      Pinching,
      Positioning,
      Receiving,
      Replacing,
      Representing,
      Sandboxing,
      Sliding,
      Streaming,
      Tabstopping,
      Transitioning,
      Unselecting
    ];

    var getDefaultBehaviours = function (spec) {
      return Arr.filter(alloyBehaviours, function (b) {
        return Objects.hasKey(spec, 'behaviours') && Objects.hasKey(spec.behaviours, b.name());
      });
    };

    var generateFrom = function (spec, all) {
      return BehaviourBlob.generateFrom(spec, all);
    };

    var generate = function (spec) {
      var custom = Objects.readOptFrom(spec, 'customBehaviours').getOr([ ]);
      var alloy = getDefaultBehaviours(spec);

      var all = custom.concat(alloy);
      return generateFrom(spec, all);
    };

    return {
      generate: generate,
      generateFrom: generateFrom
    };
  }
);
