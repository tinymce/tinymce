define(
  'ephox.alloy.api.behaviour.BehaviourExport',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Array'
  ],

  function (Objects, Arr, Obj, Merger, Fun, Array) {
    // Add some off behaviour also (alternatives).
    var build = function (behaviourName, apiNames, alternatives) {
      // If readability becomes a problem, stop dynamically generating these.

      var access = function (component) {
        return component.apis();
      };

      return Objects.wrapAll(
        Arr.bind(apiNames, function (apiName) {
          return [
            {
              key: apiName,
              // e.g. Highlighting.highlight(component, item)
              value: function (component/*, args */) {
                var args = Array.prototype.slice.call(arguments, 1);
                return access(component)[apiName].apply(undefined, args);
              }
            },
            {
              key: apiName + '_',
              // e.g. Highlighting.highlight(item)(component)
              value: function (/* */) {
                var args = Array.prototype.slice.call(arguments, 0);
                return function (component) {
                  return access(component)[apiName].apply(undefined, args);
                };
              }
            }
          ];
        })
      );
    };


    var santa = function (schema, name, activeApis, apis) {
      return Merger.deepMerge(
        Obj.map(apis, function (apiF, apiName) {
          return function (component) {
            return component.config({
              name: Fun.constant(name)
            }).fold(
              function () {  
                throw 'dog';
              },
              function (info) {
                var rest = Array.prototype.slice.call(arguments, 1);
                return apiF.apply(undefined, [ component, info ].concat(rest));
              }
            );
          };
        }),
        {
          config: function (spec) {
            return {
              key: behaviour.name(),
              value: spec
            };
          }
        }
      );
    };

    return {
      build: build,
      santa: santa
    };
  }
);