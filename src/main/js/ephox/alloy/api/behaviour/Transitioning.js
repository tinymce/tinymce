define(
  'ephox.alloy.api.behaviour.Transitioning',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.transitioning.ActiveTransitioning',
    'ephox.alloy.behaviour.transitioning.TransitionApis',
    'ephox.alloy.behaviour.transitioning.TransitionSchema'
  ],

  function (Behaviour, ActiveTransitioning, TransitionApis, TransitionSchema) {
    return Behaviour.create({
      fields: TransitionSchema,
      name: 'transitioning',
      active: ActiveTransitioning,
      apis: TransitionApis
    });
  }
);
