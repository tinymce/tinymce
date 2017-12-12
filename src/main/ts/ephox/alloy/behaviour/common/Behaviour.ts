import AlloyEvents from '../../api/events/AlloyEvents';
import FunctionAnnotator from '../../debugging/FunctionAnnotator';
import DomModification from '../../dom/DomModification';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Thunk } from '@ephox/katamari';

var executeEvent = function (bConfig, bState, executor) {
  return AlloyEvents.runOnExecute(function (component) {
    executor(component, bConfig, bState);
  });
};

var loadEvent = function (bConfig, bState, f) {
  return AlloyEvents.runOnInit(function (component, simulatedEvent) {
    f(component, bConfig, bState);
  });
};

var create = function (schema, name, active, apis, extra, state) {
  var configSchema = ValueSchema.objOfOnly(schema);
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
  var f = function (component) {
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
  return FunctionAnnotator.markAsBehaviourApi(f, apiName, apiFunction);
};

// I think the "revoke" idea is fragile at best.
var revokeBehaviour = function (name) {
  return {
    key: name,
    value: undefined
  };
};

var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state) {
  var getConfig = function (info) {
    return Objects.hasKey(info, name) ? info[name]() : Option.none();
  };

  var wrappedApis = Obj.map(apis, function (apiF, apiName) {
    return wrapApi(name, apiF, apiName);
  });

  var wrappedExtra = Obj.map(extra, function (extraF, extraName) {
    return FunctionAnnotator.markAsExtraApi(extraF, extraName);
  });

  var me = Merger.deepMerge(
    wrappedExtra,
    wrappedApis,
    {
      revoke: Fun.curry(revokeBehaviour, name),
      config: function (spec) {
        var prepared = ValueSchema.asStructOrDie(name + '-config', configSchema, spec);

        return {
          key: name,
          value: {
            config: prepared,
            me: me,
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

  return me;
};

export default <any> {
  executeEvent: executeEvent,
  loadEvent: loadEvent,
  create: create,
  createModes: createModes
};