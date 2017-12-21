import AlloyEvents from '../api/events/AlloyEvents';
import NativeEvents from '../api/events/NativeEvents';
import SystemEvents from '../api/events/SystemEvents';
import FocusManagers from '../api/focus/FocusManagers';
import Fields from '../data/Fields';
import KeyRules from '../navigation/KeyRules';
import { FieldSchema } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';

var typical = function (infoSchema, stateInit, getRules, getEvents, getApis, optFocusIn) {
  var schema = function () {
    return infoSchema.concat([
      FieldSchema.defaulted('focusManager', FocusManagers.dom()),
      Fields.output('handler', me),
      Fields.output('state', stateInit)
    ]);
  };

  var processKey = function (component, simulatedEvent, keyingConfig, keyingState) {
    var rules = getRules(component, simulatedEvent, keyingConfig, keyingState);

    return KeyRules.choose(rules, simulatedEvent.event()).bind(function (rule) {
      return rule(component, simulatedEvent, keyingConfig, keyingState);
    });
  };

  var toEvents = function (keyingConfig, keyingState) {
    var otherEvents = getEvents(keyingConfig, keyingState);
    var keyEvents = AlloyEvents.derive(
      optFocusIn.map(function (focusIn) {
        return AlloyEvents.run(SystemEvents.focus(), function (component, simulatedEvent) {
          focusIn(component, keyingConfig, keyingState, simulatedEvent);
          simulatedEvent.stop();
        });
      }).toArray().concat([
        AlloyEvents.run(NativeEvents.keydown(), function (component, simulatedEvent) {
          processKey(component, simulatedEvent, keyingConfig, keyingState).each(function (_) {
            simulatedEvent.stop();
          });
        })
      ])
    );
    return Merger.deepMerge(otherEvents, keyEvents);
  };

  var me = {
    schema: schema,
    processKey: processKey,
    toEvents: toEvents,
    toApis: getApis
  };

  return me;
};

export default <any> {
  typical: typical
};