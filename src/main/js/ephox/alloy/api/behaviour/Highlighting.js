define(
  'ephox.alloy.api.behaviour.Highlighting',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.highlighting.HighlightApis',
    'ephox.alloy.behaviour.highlighting.HighlightSchema',
    'global!Array'
  ],

  function (BehaviourExport, HighlightApis, HighlightSchema, Array) {
    // If readability becomes a problem, stop dynamically generating these.
    return BehaviourExport.santa(
      HighlightSchema,
      'highlighting',
      { },
      HighlightApis,
      { }
    );
  }
);