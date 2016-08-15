define(
  'ephox.alloy.construct.ComponentDom',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.util.ObjIndex',
    'ephox.alloy.util.PrioritySort',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.perhaps.Result'
  ],

  function (DomModification, ObjIndex, PrioritySort, Objects, Arr, Obj, Json, Fun, Option, Options, Result) {
    var behaviourDom = function (name, modification) {
      return {
        name: Fun.constant(name),
        modification: modification
      };
    };

    var missingOrder = function (chain, aspect) {
      return new Result.error([
        'The DOM modification for "' + aspect + '" has more than one behaviour that modifies it.\nWhen this occurs, you must ' + 
        'specify an ordering for the merging in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 
        'modify it are: ' + Json.stringify(Arr.map(chain, function (c) { return c.name(); }), null, 2) ]);
    };

    var sortByOrder = function (chain, apiName, orde) {
      return PrioritySort.sortKeys(apiName, 'name', chain, order).map(function (sorted) {
        var handler = function () {
          var args = Array.prototype.slice.call(arguments, 0);
          return Arr.foldl(sorted, function (acc, bApi) {
            // Derive any lazy arguments.
            return bApi.modification().apply(undefined, extra.concat(args));
          }, undefined);
        };

        return Objects.wrap(apiName, handler);
      });
    };

    var anyOrderConcat = function (chain, aspect) {
      console.log('chain', chain);
      var values = Arr.bind(chain, function (c) {
        return c.modification().getOr([ ]);
      });
      var x = Result.value(
        Objects.wrap(aspect, values)
      );
      console.log('x', values);
      return x;
    };

    var onlyOne = function (chain) {

    };

    var mergeInOrder = function (chain, aspect, order) {
      var y = Arr.foldl(chain, function (acc, c) {
        var obj = c.modification().getOr({});
        return acc.bind(function (accRest) {
          console.log('accRest', accRest);

          var ps = Obj.mapToArray(obj, function (v, k) {
            return accRest[k] !== undefined ? Result.error('Duplicate: ' + k) : 
              Result.value(Objects.wrap(k, v));
          });
          console.log("ps", ps);

          return Objects.consolidate(ps, accRest);
        });
      }, Result.value({}));

      return y.map(function (yValue) {
        console.log('y.log', yValue);
        return Objects.wrap(aspect, yValue);
      });
    };

    var mergeTypes = {
      classes: anyOrderConcat,
      attributes: mergeInOrder
    };

    var combine = function (info, behaviours, base) {
      // Get the Behaviour DOM modifications
      var behaviourDoms = { };
      Arr.each(behaviours, function (behaviour) {
        behaviourDoms[behaviour.name()] = behaviour.exhibit(info, base);
      });


      console.log('behaviourDoms', behaviourDoms);
      var byAspect = ObjIndex.byInnerKey(behaviourDoms, behaviourDom);

      console.log('byAspect', byAspect);

      var usedAspect = Obj.map(byAspect, function (values, aspect) {
        return Arr.bind(values, function (value) {
          return value.modification().fold(function () {
            return [ ];
          }, function (v) {
            return [ value ];
          });
        });
      });

      console.log('usedAspect', usedAspect);

      // Now, with all of these APIs, we need to get a list of behaviours
      

      var modOrder =  info.domModificationOrder();

      // Now, with this API index, we need to combine things. Sort them in order.
      var modifications = Obj.mapToArray(usedAspect, function (values, aspect) {
        // TODO: Use hasOwnProperty.
        if (mergeTypes[aspect] !== undefined) return mergeTypes[aspect](values, aspect, modOrder);
        if (values.length > 1) {
          var order = modOrder[aspect];
          return order === undefined ? missingOrder(values, aspect) : sortByOrder(values, aspect, order);
        } else if (values.length === 1) {
          return Result.value(
            Objects.wrap(aspect, values[0].modification())
          );
        } else {
          return Result.value({});
        }
      });

      var consolidated = Objects.consolidate(modifications, {});
      console.log('consolidated', consolidated.getOr('<none>'));
      return consolidated.map(DomModification.nu);
    };

    return {
      combine: combine
    };
  }
);