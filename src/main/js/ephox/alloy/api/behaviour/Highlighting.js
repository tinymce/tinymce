define(
  'ephox.alloy.api.behaviour.Highlighting',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.highlighting.HighlightApis',
    'ephox.alloy.behaviour.highlighting.HighlightSchema',
    'global!Array'
  ],

  function (Behaviour, NoState, HighlightApis, HighlightSchema, Array) {
    return Behaviour.create(
      HighlightSchema,
      'highlighting',
      Behaviour.noActive(),
      HighlightApis,
      Behaviour.noExtra(),
      NoState
    );
  }
);