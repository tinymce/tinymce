define(
  'ephox.alloy.api.behaviour.Composing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.composing.ComposeApis',
    'ephox.alloy.behaviour.composing.ComposeSchema'
  ],

  function (Behaviour, NoState, ComposeApis, ComposeSchema) {
    return Behaviour.create(
      ComposeSchema,
      'composing',
      { },
      ComposeApis,
      { },
      NoState
    );
  }
);