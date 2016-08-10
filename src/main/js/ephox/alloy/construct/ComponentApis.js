define(
  'ephox.alloy.construct.ComponentApis',

  [
    'ephox.alloy.util.ObjIndex',
    'ephox.alloy.util.PrioritySort',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'global!Array',
    'global!Error'
  ],

  function (ObjIndex, PrioritySort, Arr, Obj, Json, Fun, Array, Error) {
    var behaviourApi = function (name, invocation) {
      return {
        name: Fun.constant(name),
        invocation: invocation
      };
    };

    var combine = function (info, behaviours, extraArgs) {
      // Get the APIs sorted by behaviour
      var behaviourApis = { };
      Arr.each(behaviours, function (behaviour) {
        behaviourApis[behaviour.name()] = behaviour.apis(info);
      });

      // Now, with all of these APIs, we need to get a list of behaviours
      var byApiName = ObjIndex.byInnerKey(behaviourApis, behaviourApi);

      var apiOrder =  info.apiOrder();

      // Now, with this API index, we need to combine things. Sort them in order.
      return Obj.map(byApiName, function (chain, apiName) {
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
              return bApi.invocation.apply(undefined, extraArgs.concat(args));
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