define(
  'ephox.alloy.api.behaviour.Composing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.composing.ComposeApis',
    'ephox.alloy.behaviour.composing.ComposeSchema'
  ],

  function (BehaviourExport, ComposeApis, ComposeSchema) {
    // If readability becomes a problem, stop dynamically generating these.
    return BehaviourExport.santa(
      ComposeSchema,
      'composing',
      { },
      ComposeApis,
      { }
    );
  }
);