define(
  'ephox.alloy.api.behaviour.Replacing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.replacing.ReplaceApis'
  ],

  function (BehaviourExport, ReplaceApis) {
    return BehaviourExport.santa(
      // Replacing has no schema requirements
      [ ],
      'replacing',
      { },
      ReplaceApis,
      { }
    );
  }
);