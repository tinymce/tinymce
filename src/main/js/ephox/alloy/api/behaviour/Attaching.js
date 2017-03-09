define(
  'ephox.alloy.api.behaviour.Attaching',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.attaching.ActiveAttaching',
    'ephox.alloy.behaviour.attaching.AttachingSchema'
  ],

  function (Behaviour, ActiveAttaching, AttachingSchema) {
    return Behaviour.create(
      AttachingSchema,
      'attaching',
      ActiveAttaching,
      { }
    );
  }
);
