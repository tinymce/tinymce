define(
  'ephox.alloy.api.behaviour.Coupling',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.coupling.CouplingApis',
    'ephox.alloy.behaviour.coupling.CouplingSchema'
  ],

  function (BehaviourExport, CouplingApis, CouplingSchema) {
    return BehaviourExport.santa(
      CouplingSchema,
      'coupling',
      { },
      CouplingApis
    );
  }
);