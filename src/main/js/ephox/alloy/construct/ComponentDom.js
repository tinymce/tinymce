define(
  'ephox.alloy.construct.ComponentDom',

  [
    'ephox.alloy.alien.ObjIndex',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.lumber.api.Timers',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (ObjIndex, DomModification, Objects, Arr, Obj, Timers, Json, Fun, Result) {
    var behaviourDom = function (name, modification) {
      return {
        name: Fun.constant(name),
        modification: modification
      };
    };

    var concat = function (chain, aspect) {
      var values = Arr.bind(chain, function (c) {
        return c.modification().getOr([ ]);
      });
      return Result.value(
        Objects.wrap(aspect, values)
      );
    };

    var onlyOne = function (chain, aspect, order) {
      if (chain.length > 1) return Result.error(
        'Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' + 
          Json.stringify(Arr.map(chain, function (b) { return b.name(); })) + '. At this stage, this ' +
          'is not supported. Future releases might provide strategies for resolving this.' 
      );
      else if (chain.length === 0) return  Result.value({ });
      else return Result.value(
        chain[0].modification().fold(function () {
          return { };
        }, function (m) {
          return Objects.wrap(aspect, m);
        })
      );
    };

    var duplicate = function (aspect, k, obj, behaviours) {
      return Result.error('Mulitple behaviours have tried to change the _' + k + '_ "' + aspect + '"' +
        '. The guilty behaviours are: ' + Json.stringify(Arr.bind(behaviours, function (b) {
          return b.modification().getOr({})[k] !== undefined ? [ b.name() ] : [ ];
        }), null, 2) + '. This is not currently supported.'
      );
    };

    var unsafeMerge = function (chain, aspect) {
      var output = { };
      Arr.each(chain, function (c) {
        var obj = c.modification().getOr({ });
        Obj.each(obj, function (v, k) {
          output[k] = v;
        });
      });
      return Result.value(
        Objects.wrap(aspect, output)
      );
    };

    var safeMerge = function (chain, aspect) {
      return Timers.run('safeMerge', function () {
        return unsafeMerge(chain, aspect);
        var y = Arr.foldl(chain, function (acc, c) {
          var obj = c.modification().getOr({});
          return acc.bind(function (accRest) {
            var parts = Obj.mapToArray(obj, function (v, k) {
              return accRest[k] !== undefined ? duplicate(aspect, k, obj, chain) : 
                Result.value(Objects.wrap(k, v));
            });
            return Objects.consolidate(parts, accRest);
          });
        }, Result.value({}));

        return y.map(function (yValue) {
          return Objects.wrap(aspect, yValue);
        });
      });
    };

    var mergeTypes = {
      classes: concat,
      attributes: safeMerge,
      styles: safeMerge,

      // Group these together somehow
      domChildren: onlyOne,
      defChildren: onlyOne,
      innerHtml: onlyOne,

      value: onlyOne
    };

    var combine = function (info, behaviours, base) {
      // Get the Behaviour DOM modifications
      var behaviourDoms = Timers.run('combine.behaviours', function () {
        var b = { };
        Arr.each(behaviours, function (behaviour) {
          b[behaviour.name()] = behaviour.exhibit(info, base);
        });
        return b;
      });

      var byAspect = Timers.run('combine.innerkey', function () {
        return ObjIndex.byInnerKey(behaviourDoms, behaviourDom);
      });

      var usedAspect = Timers.run('combine.usedAspect', function () {
        return Obj.map(byAspect, function (values, aspect) {
          return Arr.bind(values, function (value) {
            return value.modification().fold(function () {
              return [ ];
            }, function (v) {
              return [ value ];
            });
          });
        });
      });

      var modifications = Timers.run('combine.modifications', function () {
        return Obj.mapToArray(usedAspect, function (values, aspect) {
          return Objects.readOptFrom(mergeTypes, aspect).fold(function () {
            return Result.error('Unknown field type: ' + aspect);
          }, function (merger ){
            return Timers.run('combine.merger', function () {
              return merger(values, aspect);
            });
          });
        });
      });

      var consolidated = Timers.run('combine.consolidate', function () {
        return Objects.consolidate(modifications, {});
      });


      return Timers.run('combine.return', function () {
        return consolidated.map(DomModification.nu);
      });
    };

    return {
      combine: combine
    };
  }
);