import { FieldSchema } from '@ephox/boulder';
import { Merger, Option } from '@ephox/katamari';

import * as AlloyEvents from '../api/events/AlloyEvents';
import * as NativeEvents from '../api/events/NativeEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import * as FocusManagers from '../api/focus/FocusManagers';
import * as Fields from '../data/Fields';
import * as KeyRules from '../navigation/KeyRules';

const typical = function (infoSchema, stateInit, getRules, getEvents, getApis, optFocusIn) {
  const schema = function () {
    return infoSchema.concat([
      FieldSchema.defaulted('focusManager', FocusManagers.dom()),
      Fields.output('handler', me),
      Fields.output('state', stateInit)
    ]);
  };

  const processKey = function (component, simulatedEvent, keyingConfig, keyingState) {
    const rules = getRules(component, simulatedEvent, keyingConfig, keyingState);

    return KeyRules.choose(rules, simulatedEvent.event()).bind(function (rule) {
      return rule(component, simulatedEvent, keyingConfig, keyingState);
    });
  };

  const toEvents = function (keyingConfig, keyingState) {
    const otherEvents = getEvents(keyingConfig, keyingState);
    const keyEvents = AlloyEvents.derive(
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

  const me = {
    schema,
    processKey,
    toEvents,
    toApis: getApis
  };

  return me;
};

export {
  typical
};