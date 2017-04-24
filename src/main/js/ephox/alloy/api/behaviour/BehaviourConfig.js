define(
  'ephox.alloy.api.behaviour.BehaviourConfig',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { 'prepared': [ 'validated' ] },
      { 'draft': [ 'config' ] }
    ]);

    return {
      prepared: adt.prepared,
      draft: adt.draft
    };
  }
);
