define(
  'ephox.alloy.behaviour.common.Behaviour',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun',
    'global!Array',
    'global!Error',
    'global!console'
  ],

  function (EventRoot, SystemEvents, EventHandler, DomModification, Objects, Obj, Merger, Fun, Array, Error, console) {
    var executeEvent = function (toggleInfo, executor) {
      return {
        key: SystemEvents.execute(),
        value: EventHandler.nu({
          run: function (component) {
            executor(component, toggleInfo);
          }
        })
      };
    };

    var loadEvent = function (toggleInfo, f) {
      return {
        key: SystemEvents.systemInit(),
        value: EventHandler.nu({
          run: function (component, simulatedEvent) {
            if (EventRoot.isSource(component, simulatedEvent)) {
              f(component, toggleInfo);
            }
          }
        })
      };
    };

    var create = function (schema, name, active, apis, extra) {
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

    return {
      executeEvent: executeEvent,
      loadEvent: loadEvent,
      create: create
    };
  }
);