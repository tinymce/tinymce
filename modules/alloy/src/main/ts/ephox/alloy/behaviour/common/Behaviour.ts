import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Fun, Obj, Option, Thunk } from '@ephox/katamari';

import { AlloyBehaviour } from '../../api/behaviour/Behaviour';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import * as DomModification from '../../dom/DomModification';
import { CustomEvent } from '../../events/SimulatedEvent';

const executeEvent = (bConfig, bState, executor): AlloyEvents.AlloyEventKeyAndHandler<CustomEvent> => {
  return AlloyEvents.runOnExecute((component) => {
    executor(component, bConfig, bState);
  });
};

const loadEvent = (bConfig, bState, f): AlloyEvents.AlloyEventKeyAndHandler<CustomEvent> => {
  return AlloyEvents.runOnInit((component, simulatedEvent) => {
    f(component, bConfig, bState);
  });
};

const create = (schema, name: string, active, apis, extra, state): AlloyBehaviour<any, any> => {
  const configSchema = ValueSchema.objOfOnly(schema);
  const schemaSchema = FieldSchema.optionObjOf(name, [
    FieldSchema.optionObjOfOnly('config', schema)
  ]);
  return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
};

const createModes = (modes, name: string, active, apis, extra, state): AlloyBehaviour<any, any> => {
  const configSchema = modes;
  const schemaSchema = FieldSchema.optionObjOf(name, [
    FieldSchema.optionOf('config', modes)
  ]);
  return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
};

const wrapApi = (bName: string, apiFunction, apiName) => {
  const f = (component, ...rest) => {
    const args = [ component ].concat(rest);
    return component.config({
      name: Fun.constant(bName)
    }).fold(
      () => {
        throw new Error('We could not find any behaviour configuration for: ' + bName + '. Using API: ' + apiName);
      },
      (info) => {
        const rest = Array.prototype.slice.call(args, 1);
        return apiFunction.apply(undefined, [ component, info.config, info.state ].concat(rest));
      }
    );
  };
  return FunctionAnnotator.markAsBehaviourApi(f, apiName, apiFunction);
};

// I think the "revoke" idea is fragile at best.
const revokeBehaviour = (name: string) => {
  return {
    key: name,
    value: undefined
  };
};

const doCreate = (configSchema, schemaSchema, name: string, active, apis, extra, state): AlloyBehaviour<any, any> => {
  const getConfig = (info) => {
    return Objects.hasKey(info, name) ? info[name]() : Option.none();
  };

  const wrappedApis = Obj.map(apis, (apiF, apiName) => {
    return wrapApi(name, apiF, apiName);
  });

  const wrappedExtra = Obj.map(extra, (extraF, extraName) => {
    return FunctionAnnotator.markAsExtraApi(extraF, extraName);
  });

  const me = {
    ...wrappedExtra,
    ...wrappedApis,
    revoke: Fun.curry(revokeBehaviour, name),
    config (spec) {
      const prepared = ValueSchema.asRawOrDie(name + '-config', configSchema, spec);

      return {
        key: name,
        value: {
          config: prepared,
          me,
          configAsRaw: Thunk.cached(() => {
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
      return getConfig(info).bind((behaviourInfo) => {
        return Objects.readOptFrom<any>(active, 'exhibit').map((exhibitor) => {
          return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
        });
      }).getOr(DomModification.nu({ }));
    },

    name () {
      return name;
    },

    handlers (info) {
      return getConfig(info).map((behaviourInfo) => {
        const getEvents = Objects.readOr('events', (a, b) => ({ }))(active);
        return getEvents(behaviourInfo.config, behaviourInfo.state);
      }).getOr({ });
    }
  };

  return me;
};

export {
  executeEvent,
  loadEvent,
  create,
  createModes
};
