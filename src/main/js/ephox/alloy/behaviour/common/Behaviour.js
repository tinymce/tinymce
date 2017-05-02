define(
  'ephox.alloy.behaviour.common.Behaviour',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Thunk',
    'global!Array',
    'global!console',
    'global!Error'
  ],

  function (EventRoot, SystemEvents, EventHandler, DomModification, FieldSchema, Objects, ValueSchema, Fun, Merger, Obj, Option, Thunk, Array, console, Error) {
    var executeEvent = function (bConfig, bState, executor) {
      return {
        key: SystemEvents.execute(),
        value: EventHandler.nu({
          run: function (component) {
            executor(component, bConfig, bState);
          }
        })
      };
    };

    var loadEvent = function (bConfig, bState, f) {
      return {
        key: SystemEvents.systemInit(),
        value: EventHandler.nu({
          run: function (component, simulatedEvent) {
            if (EventRoot.isSource(component, simulatedEvent)) {
              f(component, bConfig, bState);
            }
          }
        })
      };
    };

    var create = function (schema, name, active, apis, extra, state) {
      var configSchema = ValueSchema.objOf(schema);
      var schemaSchema = FieldSchema.optionObjOf(name, [
        FieldSchema.optionObjOfOnly('config', schema)
      ]);
      return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
    };

    var createModes = function (modes, name, active, apis, extra, state) {
      var configSchema = modes;
      var schemaSchema = FieldSchema.optionObjOf(name, [
        FieldSchema.optionOf('config', modes)
      ]);
      return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
    };

    var wrapApi = function (bName, apiFunction, apiName) {
      return function (component) {
        var args = arguments;
        return component.config({
          name: Fun.constant(bName)
        }).fold(
          function () {
            throw new Error('We could not find any behaviour configuration for: ' + bName + '. Using API: ' + apiName);
          },
          function (info) {
            var rest = Array.prototype.slice.call(args, 1);
            return apiFunction.apply(undefined, [ component, info.config, info.state ].concat(rest));
          }
        );
      };
    };

    var revokeBehaviour = function (name) {
      return Objects.wrap(name, undefined);
    };

    var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state) {
      var getConfig = function (info) {
        return Objects.hasKey(info, name) ? info[name]() : Option.none();
      };

      var wrappedApis = Obj.map(apis, function (apiF, apiName) {
        return wrapApi(name, apiF, apiName);
      });

      return Merger.deepMerge(
        extra,
        wrappedApis,
        {
          revoke: Fun.curry(revokeBehaviour, name),
          config: function (spec) {
            var prepared = ValueSchema.asStructOrDie(name + '-config', configSchema, spec);
            
            return {
              key: name,
              value: {
                config: prepared,
                configAsRaw: Thunk.cached(function () {
                  return ValueSchema.asRawOrDie(name + '-config', configSchema, spec);
                }),
                initialConfig: spec,
                state: state
              }
            };
          },

          schema: function () {
            return schemaSchema;
          },

          exhibit: function (info, base) {
            return getConfig(info).bind(function (behaviourInfo) {
              return Objects.readOptFrom(active, 'exhibit').map(function (exhibitor) {
                return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
              });
            }).getOr(DomModification.nu({ }));
          },

          name: function () {
            return name;
          },

          handlers: function (info) {
            return getConfig(info).bind(function (behaviourInfo) {
              return Objects.readOptFrom(active, 'events').map(function (events) {
                return events(behaviourInfo.config, behaviourInfo.state);
              });
            }).getOr({ });
          }
        }
      );
    };

    return {
      executeEvent: executeEvent,
      loadEvent: loadEvent,
      create: create,
      createModes: createModes
    };
  }
);