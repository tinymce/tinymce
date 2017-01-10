define(
  'ephox.alloy.api.behaviour.Composing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.composing.ComposeApis',
    'ephox.alloy.behaviour.composing.ComposeSchema'
  ],

  function (Behaviour, ComposeApis, ComposeSchema) {
    // If readability becomes a problem, stop dynamically generating these.
    return Behaviour.create(
      ComposeSchema,
      'composing',
      { },
      ComposeApis,
      { }
    );
  }
);