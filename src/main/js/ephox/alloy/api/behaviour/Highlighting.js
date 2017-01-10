define(
  'ephox.alloy.api.behaviour.Highlighting',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.highlighting.HighlightApis',
    'ephox.alloy.behaviour.highlighting.HighlightSchema',
    'global!Array'
  ],

  function (Behaviour, HighlightApis, HighlightSchema, Array) {
    // If readability becomes a problem, stop dynamically generating these.
    return Behaviour.create(
      HighlightSchema,
      'highlighting',
      { },
      HighlightApis,
      { }
    );
  }
);