import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Merger, Option } from '@ephox/katamari';

import { SugarEvent } from '../alien/TypeDefinitions';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyEvents from '../api/events/AlloyEvents';
import * as NativeEvents from '../api/events/NativeEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import * as FocusManagers from '../api/focus/FocusManagers';
import { BehaviourState } from '../behaviour/common/BehaviourState';
import * as Fields from '../data/Fields';
import { NativeSimulatedEvent } from '../events/SimulatedEvent';
import * as KeyRules from '../navigation/KeyRules';

const typical = <C, S>(
  infoSchema: FieldProcessorAdt[],
  stateInit: (config: C) => BehaviourState,
  getRules: (comp: AlloyComponent, se: NativeSimulatedEvent, config: C, state?: S) => Array<KeyRules.KeyRule<C, S>>,
  getEvents: (config: C, state?: S) => AlloyEvents.AlloyEventRecord,
  getApis,
  optFocusIn) => {
  const schema = () => {
    return infoSchema.concat([
      FieldSchema.defaulted('focusManager', FocusManagers.dom()),
      Fields.output('handler', me),
      Fields.output('state', stateInit)
    ]);
  };

  const processKey = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, keyingConfig: C, keyingState?: S): Option<boolean> => {
    console.log('Looking for rule', component.element().dom());
    const rules = getRules(component, simulatedEvent, keyingConfig, keyingState);

    return KeyRules.choose(rules, simulatedEvent.event()).bind((rule) => {
      console.log('found rule', component.element().dom());
      return rule(component, simulatedEvent, keyingConfig, keyingState);
    });
  };

  const toEvents = (keyingConfig: C, keyingState: S): AlloyEvents.AlloyEventRecord => {
    const otherEvents = getEvents(keyingConfig, keyingState);
    const keyEvents = AlloyEvents.derive(
      optFocusIn.map((focusIn) => {
        return AlloyEvents.run(SystemEvents.focus(), (component, simulatedEvent) => {
          focusIn(component, keyingConfig, keyingState, simulatedEvent);
          simulatedEvent.stop();
        });
      }).toArray().concat([
        AlloyEvents.run<SugarEvent>(NativeEvents.keydown(), (component, simulatedEvent) => {
          processKey(component, simulatedEvent, keyingConfig, keyingState).each((_) => {
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