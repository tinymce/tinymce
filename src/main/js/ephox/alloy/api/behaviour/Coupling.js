define(
  'ephox.alloy.api.behaviour.Coupling',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.coupling.CouplingApis',
    'ephox.alloy.behaviour.coupling.CouplingSchema',
    'ephox.alloy.behaviour.coupling.CouplingState'
  ],

  function (Behaviour, CouplingApis, CouplingSchema, CouplingState) {
    return Behaviour.create(
      CouplingSchema,
      'coupling',
      { },
      CouplingApis,
      { },
      CouplingState
    );
  }
);