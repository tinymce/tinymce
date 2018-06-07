import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Fun, Merger, Obj, Option, Thunk } from '@ephox/katamari';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import * as DomModification from '../../dom/DomModification';
import { AlloyBehaviour } from 'ephox/alloy/api/behaviour/Behaviour';
import { CustomEvent } from '../../events/SimulatedEvent';

const executeEvent = function (bConfig, bState, executor): AlloyEvents.EventHandlerConfig<CustomEvent> {
  return AlloyEvents.runOnExecute(function (component) {
    executor(component, bConfig, bState);
  });
};

const loadEvent = function (bConfig, bState, f): AlloyEvents.EventHandlerConfig<CustomEvent> {
  return AlloyEvents.runOnInit(function (component, simulatedEvent) {
    f(component, bConfig, bState);
  });
};

const create = function (schema, name, active, apis, extra, state): AlloyBehaviour {
  const configSchema = ValueSchema.objOfOnly(schema);
  const schemaSchema = FieldSchema.optionObjOf(name, [
    FieldSchema.optionObjOfOnly('config', schema)
  ]);
  return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
};

const createModes = function (modes, name, active, apis, extra, state): AlloyBehaviour {
  const configSchema = modes;
  const schemaSchema = FieldSchema.optionObjOf(name, [
    FieldSchema.optionOf('config', modes)
  ]);
  return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
};

const wrapApi = function (bName, apiFunction, apiName) {
  const f = function (component) {
    const args = arguments;
    return component.config({
      name: Fun.constant(bName)
    }).fold(
      function () {
        throw new Error('We could not find any behaviour configuration for: ' + bName + '. Using API: ' + apiName);
      },
      function (info) {
        const rest = Array.prototype.slice.call(args, 1);
        return apiFunction.apply(undefined, [ component, info.config, info.state ].concat(rest));
      }
    );
  };
  return FunctionAnnotator.markAsBehaviourApi(f, apiName, apiFunction);
};

// I think the "revoke" idea is fragile at best.
const revokeBehaviour = function (name) {
  return {
    key: name,
    value: undefined
  };
};

const doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state): AlloyBehaviour {
  const getConfig = function (info) {
    return Objects.hasKey(info, name) ? info[name]() : Option.none();
  };

  const wrappedApis = Obj.map(apis, function (apiF, apiName) {
    return wrapApi(name, apiF, apiName);
  });

  const wrappedExtra = Obj.map(extra, function (extraF, extraName) {
    return FunctionAnnotator.markAsExtraApi(extraF, extraName);
  });

  const me = Merger.deepMerge(
    wrappedExtra,
    wrappedApis,
    {
      revoke: Fun.curry(revokeBehaviour, name),
      config (spec) {
        const prepared = ValueSchema.asStructOrDie(name + '-config', configSchema, spec);

        return {
          key: name,
          value: {
            config: prepared,
            me,
            configAsRaw: Thunk.cached(function () {
              return ValueSchema.asRawOrDie(name + '-config', configSchema, spec);
            }),
            initialConfig: spec,
            state
          }
        };
      },

      schema () {
        return schemaSchema;
      },

      exhibit (info, base) {
        return getConfig(info).bind(function (behaviourInfo) {
          return Objects.readOptFrom(active, 'exhibit').map(function (exhibitor) {
            return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr(DomModification.nu({ }));
      },

      name () {
        return name;
      },

      handlers (info) {
        return getConfig(info).bind(function (behaviourInfo) {
          return Objects.readOptFrom(active, 'events').map(function (events) {
            return events(behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr({ });
      }
    }
  );

  return me;
};

export {
  executeEvent,
  loadEvent,
  create,
  createModes
};