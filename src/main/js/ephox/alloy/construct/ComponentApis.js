define(
  'ephox.alloy.construct.ComponentApis',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.numerosity.api.JSON',
    'global!Array',
    'global!Error'
  ],

  function (Objects, Arr, Obj, Json, Array, Error) {
    // Probably should take this opportunity to pass through labby/component as well :)
    var combine = function (info, behaviours, extra) {
      // We need to go through all the behaviours. If at any time, the API already exists, we need to
      // consult the order. I might do this in an inefficient way to start with, and then improve it later.

      // Get all the apis first
     

      // Get the APIs sorted by behaviour
      var behaviourApis = { };
      Arr.each(behaviours, function (behaviour) {
        behaviourApis[behaviour.name()] = behaviour.apis(info);
      });

      // Now, with all of these APIs, we need to get a list of behaviours
      var apiChains = { };
      Obj.each(behaviourApis, function (apis, behaviourName) {
        Obj.each(apis, function (v, k) {
          // TODO: Has own property.
          var chain = Objects.readOr(k, [ ])(apiChains);
          chain = chain.concat({ b: behaviourName, h: v });
          apiChains[k] = chain;
        });
      });

      // TODO: Add something to boulder to merge in some defaults.
      var apiOrder =  info.apiOrder();

      // Now, with this API chain list, we need to combine things. Sort them in order.
      return Obj.map(apiChains, function (chain, apiName) {
        if (chain.length > 1) {
          var order = apiOrder[apiName];
          if (! order) throw new Error(
            'The API call (' + apiName + ') has more than one behaviour that triggers it.\nWhen this occurs, you must ' + 
            'specify an API ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 
            'can trigger it are: ' + Json.stringify(Arr.map(chain, function (c) { return c.b; }), null, 2)
          );        
          var sorted = chain.slice(0).sort(function (a, b) {
            var aIndex = order.indexOf(a.b);
            var bIndex = order.indexOf(b.b);
            if (aIndex === -1) throw new Error('The API ordering for ' + apiName + ' does not have an entry for ' + a.b);
            if (bIndex === -1) throw new Error('The API ordering for ' + apiName + ' does not have an entry for ' + b.b);
            if (aIndex < bIndex) return -1;
            else if (bIndex < aIndex) return 1;
            else return 0;
          });

          return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            return Arr.foldl(sorted, function (acc, b) {
              return b.h.apply(undefined, extra.concat(args));
            }, undefined);
          };
        } else {
          return chain[0].h;
        }
      });
    };

    return {
      combine: combine
    };
  }
);