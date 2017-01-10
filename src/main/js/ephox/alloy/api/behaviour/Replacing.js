define(
  'ephox.alloy.api.behaviour.Replacing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.replacing.ReplaceApis'
  ],

  function (Behaviour, ReplaceApis) {
    return Behaviour.create(
      // Replacing has no schema requirements
      [ ],
      'replacing',
      { },
      ReplaceApis,
      { }
    );
  }
);