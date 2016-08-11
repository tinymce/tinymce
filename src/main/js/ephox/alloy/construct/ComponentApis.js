define(
  'ephox.alloy.construct.ComponentApis',

  [
    'ephox.alloy.util.ExtraArgs',
    'ephox.alloy.util.ObjIndex',
    'ephox.alloy.util.PrioritySort',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Array',
    'global!Error'
  ],

  function (ExtraArgs, ObjIndex, PrioritySort, Objects, Arr, Obj, Json, Fun, Result, Array, Error) {
    var behaviourApi = function (name, invocation) {
      return {
        name: Fun.constant(name),
        invocation: invocation
      };
    };

    var missingOrder = function (chain, apiName) {
      return new Result.error([
        'The API call (' + apiName + ') has more than one behaviour that triggers it.\nWhen this occurs, you must ' + 
        'specify an API ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 
        'can trigger it are: ' + Json.stringify(Arr.map(chain, function (c) { return c.name(); }), null, 2)
      ]);     
    };

    var sortByOrder = function (chain, apiName, order, extraArgs) {
      return PrioritySort.sortKeys(apiName, 'name', chain, order).map(function (sorted) {
        var handler = function () {
          var args = Array.prototype.slice.call(arguments, 0);
          var extra = ExtraArgs.get(extraArgs);
          return Arr.foldl(sorted, function (acc, bApi) {
            // Derive any lazy arguments.
            return bApi.invocation.apply(undefined, extra.concat(args));
          }, undefined);
        };

        return Objects.wrap(apiName, handler);
      });
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
      var apis = Obj.mapToArray(byApiName, function (chain, apiName) {
        if (chain.length > 1) {
          var order = apiOrder[apiName];
          return order === undefined ? missingOrder(chain, apiName) : sortByOrder(chain, apiName, order, extraArgs);
        } else {
          return Result.value(
            Objects.wrap(apiName, ExtraArgs.augment(chain[0].invocation, extraArgs))
          );
        }
      });

      return Objects.consolidate(apis, {});
    };

    return {
      combine: combine
    };
  }
);