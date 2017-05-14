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
      var r = { };
      Obj.each(routes, function (v, k) {
        var waypoints = k.split('<->');
        r[waypoints[0]] = Objects.wrap(waypoints[1], v);
        r[waypoints[1]] = Objects.wrap(waypoints[0], v);
      });
      return r;
    };

    var createBistate = function (first, second, transitions) {
      return Objects.wrapAll([
        { key: first, value: Objects.wrap(second, transitions) },
        { key: second, value: Objects.wrap(first, transitions) }
      ]);
    };

    var createTristate = function (first, second, third, transitions) {
      return Objects.wrapAll([
        {
          key: first,
          value: Objects.wrapAll([
            { key: second, value: transitions },
            { key: third, value: transitions }
          ])
        },
        {
          key: second,
          value: Objects.wrapAll([
            { key: first, value: transitions },
            { key: third, value: transitions }
          ])
        },
        {
          key: third,
          value: Objects.wrapAll([
            { key: first, value: transitions },
            { key: second, value: transitions }
          ])
        }
      ]);
    };

    return Behaviour.create({
      fields: TransitionSchema,
      name: 'transitioning',
      active: ActiveTransitioning,
      apis: TransitionApis,
      extra: {
        createRoutes: createRoutes,
        createBistate: createBistate,
        createTristate: createTristate
      }
    });
  }
);
