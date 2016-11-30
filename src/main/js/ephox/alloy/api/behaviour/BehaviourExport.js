define(
  'ephox.alloy.api.behaviour.BehaviourExport',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Array'
  ],

  function (FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Fun, Array) {
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

    // var scorps = {
    //   config: function (s) {
    //     return {
    //       key: 'scorps',
    //       value: {
    //         raw: s,
    //         info: schema(s)
    //       }
    //     };
    //   }
    // };


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
              key: name,
              value: {
                _raw: spec,
                info: Fun.constant(
                  ValueSchema.asStructOrDie(
                    'santa' + name,
                    ValueSchema.objOf(schema),
                    spec
                  )
                )
              }
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