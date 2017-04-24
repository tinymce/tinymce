define(
  'ephox.alloy.api.behaviour.Replacing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.replacing.ReplaceApis'
  ],

  function (Behaviour, NoState, ReplaceApis) {
    return Behaviour.create(
      // Replacing has no schema requirements
      [ ],
      'replacing',
      { },
      ReplaceApis,
      { },
      NoState
    );
  }
);