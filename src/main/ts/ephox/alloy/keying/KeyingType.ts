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
  getKeydownRules: (comp: AlloyComponent, se: NativeSimulatedEvent, config: C, state?: S) => Array<KeyRules.KeyRule<C, S>>,
  getKeyupRules: (comp: AlloyComponent, se: NativeSimulatedEvent, config: C, state?: S) => Array<KeyRules.KeyRule<C, S>>,
  optFocusIn) => {
  const schema = () => {
    return infoSchema.concat([
      FieldSchema.defaulted('focusManager', FocusManagers.dom()),
      Fields.output('handler', me),
      Fields.output('state', stateInit)
    ]);
  };

  const processKey = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, getRules, keyingConfig: C, keyingState?: S): Option<boolean> => {
    const rules = getRules(component, simulatedEvent, keyingConfig, keyingState);

    return KeyRules.choose(rules, simulatedEvent.event()).bind((rule) => {
      return rule(component, simulatedEvent, keyingConfig, keyingState);
    });
  };

  const toEvents = (keyingConfig: C, keyingState: S): AlloyEvents.AlloyEventRecord => {
    return AlloyEvents.derive(
      optFocusIn.map((focusIn) => {
        return AlloyEvents.run(SystemEvents.focus(), (component, simulatedEvent) => {
          focusIn(component, keyingConfig, keyingState, simulatedEvent);
          simulatedEvent.stop();
        });
      }).toArray().concat([
        AlloyEvents.run<SugarEvent>(NativeEvents.keydown(), (component, simulatedEvent) => {
          processKey(component, simulatedEvent, getKeydownRules, keyingConfig, keyingState).each((_) => {
            simulatedEvent.stop();
          });
        }),
        AlloyEvents.run<SugarEvent>(NativeEvents.keyup(), (component, simulatedEvent) => {
          processKey(component, simulatedEvent, getKeyupRules, keyingConfig, keyingState).each((_) => {
            simulatedEvent.stop();
          });
        })
      ])
    );
  };

  const me = {
    schema,
    processKey,
    toEvents
  };

  return me;
};

export {
  typical
};