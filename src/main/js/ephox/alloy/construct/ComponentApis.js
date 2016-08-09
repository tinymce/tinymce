define(
  'ephox.alloy.construct.ComponentApis',

  [
    'ephox.alloy.util.PrioritySort',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'global!Array',
    'global!Error'
  ],

  function (PrioritySort, Objects, Arr, Obj, Json, Fun, Array, Error) {
    var behaviourApi = function (name, invocation) {
      return {
        name: Fun.constant(name),
        invocation: invocation
      };
    };

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
          chain = chain.concat([
            behaviourApi(behaviourName, v)
          ]);
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

          var sorted = PrioritySort.sortKeys(apiName, 'name', chain, order).getOrDie();

          return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            return Arr.foldl(sorted, function (acc, bApi) {
              return bApi.invocation.apply(undefined, extra.concat(args));
            }, undefined);
          };
        } else {
          return chain[0].invocation;
        }
      });
    };

    return {
      combine: combine
    };
  }
);