define(
  'ephox.alloy.api.behaviour.Transitioning',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.transitioning.ActiveTransitioning',
    'ephox.alloy.behaviour.transitioning.TransitionApis',
    'ephox.alloy.behaviour.transitioning.TransitionSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Obj'
  ],

  function (Behaviour, ActiveTransitioning, TransitionApis, TransitionSchema, Objects, Obj) {
    var createRoutes = function (routes) {
      var r =  { };
      Obj.each(routes, function (v, k) {
        var waypoints = k.split('<->');
        r[waypoints[0]] = Objects.wrap(waypoints[1], v);
        r[waypoints[1]] = Objects.wrap(waypoints[0], v);
      });
      return r;
    };

    return Behaviour.create({
      fields: TransitionSchema,
      name: 'transitioning',
      active: ActiveTransitioning,
      apis: TransitionApis,
      extra: {
        createRoutes: createRoutes
      }
    });
  }
);
