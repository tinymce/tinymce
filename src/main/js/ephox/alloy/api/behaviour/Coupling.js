define(
  'ephox.alloy.api.behaviour.Coupling',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.coupling.CouplingApis',
    'ephox.alloy.behaviour.coupling.CouplingSchema'
  ],

  function (Behaviour, CouplingApis, CouplingSchema) {
    return Behaviour.create(
      CouplingSchema,
      'coupling',
      { },
      CouplingApis
    );
  }
);