define(
  'ephox.alloy.api.behaviour.BehaviourExport',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Array',
    'global!Error'
  ],

  function (DomModification, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Fun, Array, Error) {
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

    var santa = function (fields, name, active, apis, extra) {
      return doSanta(
        FieldSchema.optionObjOf(name, fields),
        name,
        active,
        apis,
        extra
      );
    };

    var modeSanta = function (branchKey, branches, name, active, apis, extra) {
      return doSanta(
        FieldSchema.optionOf(name, ValueSchema.choose(branchKey, branches)),
        name,
        active,
        apis,
        extra
      );
    };

    var doSanta = function (schema, name, active, apis, extra) {
      var getConfig = function (info) {
        return info.behaviours().bind(function (bs) {
          return bs[name]();
        });
      };

      return Merger.deepMerge(
        extra !== undefined ? extra : { },
        Obj.map(apis, function (apiF, apiName) {
          return function (component) {
            var args = arguments;
            return component.config({
              name: Fun.constant(name)
            }).fold(
              function () {
                component.logSpec();
                throw new Error('We could not find any behaviour configuration for: ' + name + '. Using API: ' + apiName);
              },
              function (info) {
                var rest = Array.prototype.slice.call(args, 1);
                return apiF.apply(undefined, [ component, info ].concat(rest));
              }
            );
          };
        }),
        {
          config: function (spec) {
            return {
              key: name,
              value: spec
            };
          },

          schema: function () {
            return schema;
            // return FieldSchema.optionObjOf(name, schema);
          },

          exhibit: function (info, base) {
            return getConfig(info).bind(function (behaviourInfo) {
              return Objects.readOptFrom(active, 'exhibit').map(function (exhibitor) {
                return exhibitor(base, behaviourInfo);
              });
            }).getOr(DomModification.nu({ }));
          },

          name: function () {
            return name;
          },

          handlers: function (info) {
            return getConfig(info).bind(function (behaviourInfo) {
              return Objects.readOptFrom(active, 'events').map(function (events) {
                return events(behaviourInfo);
              });
            }).getOr({ });
          }
        }
      );
    };

    var exhibitor = function (name, exhibition) {
      return santa([ ], name, {
        exhibit: exhibition
      }, { }, { });
    };

    return {
      build: build,
      modeSanta: modeSanta,
      exhibitor: exhibitor,
      santa: santa
    };
  }
);