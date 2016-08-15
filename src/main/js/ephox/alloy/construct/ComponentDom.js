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

    var onlyOne = function (chain, aspect, order) {
      console.log('chain', chain);
      if (chain.length > 1) return Result.error('Only one can specify');
      else if (chain.length === 0) return  Result.value({ });
      else return Result.value(
        chain[0].modification().fold(function () {
          return { };
        }, function (m) {
          return Objects.wrap(aspect, m);
        })
      );
    };

    var mergeInOrder = function (chain, aspect) {
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
      attributes: mergeInOrder,
      styles: mergeInOrder,

      // Group these together somehow
      domChildren: onlyOne,
      defChildren: onlyOne,
      innerHtml: onlyOne,


      value: onlyOne
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
      

      // Now, with this API index, we need to combine things. Sort them in order.
      var modifications = Obj.mapToArray(usedAspect, function (values, aspect) {
        // TODO: Use hasOwnProperty.
        if (mergeTypes[aspect] !== undefined) return mergeTypes[aspect](values, aspect);
        else return Result.error('Unknown field type: ' + aspect);
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