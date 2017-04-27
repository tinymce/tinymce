define(
  'ephox.alloy.behaviour.common.Behaviour',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.common.NoState',
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

  function (EventRoot, SystemEvents, NoState, EventHandler, DomModification, FieldSchema, Objects, ValueSchema, Fun, Merger, Obj, Option, Thunk, Array, console, Error) {
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

    var create = function (schema, name, active, apis, extra, _state) {
      var configSchema = ValueSchema.objOf(schema);
      var schemaSchema = FieldSchema.optionObjOf(name, [
        FieldSchema.optionObjOfOnly('config', schema)
      ]);
      return doCreate(configSchema, schemaSchema, name, active, apis, extra, _state);
    };

    var createModes = function (modes, name, active, apis, extra, _state) {
      var configSchema = modes;
      var schemaSchema = FieldSchema.optionObjOf(name, [
        FieldSchema.optionOf('config', modes)
      ]);
      return doCreate(configSchema, schemaSchema, name, active, apis, extra, _state);
    };

    var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, _state) {
      var state = _state !== undefined ? _state : NoState;
      var getConfig = function (info) {
        return Objects.hasKey(info, name) ? info[name]() : Option.none();
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
                return apiF.apply(undefined, [ component, info.config, info.state ].concat(rest));
              }
            );
          };
        }),
        {
          delegation: function (component, cConfig, cState) {
            return Obj.map(apis, function (apiF, apiName) {
              return function (/* */) {
                var rest = Array.prototype.slice.call(arguments, 1);
                return apiF.apply(undefined, [ component, cConfig, cState ].concat(rest));
              };
            });
          }
        },
        {
          revoke: function () {
            return {
              key: name,
              value: undefined
            };
          },

          config: function (spec) {
            if (spec === undefined) return { key: name, value: undefined };

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
            console.log(name, 'handlers', info);
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