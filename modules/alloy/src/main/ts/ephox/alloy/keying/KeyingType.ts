import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Option, Result } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import * as EventRoot from '../alien/EventRoot';
import * as Keys from '../alien/Keys';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyEvents from '../api/events/AlloyEvents';
import * as NativeEvents from '../api/events/NativeEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import * as FocusManagers from '../api/focus/FocusManagers';
import { BehaviourState } from '../behaviour/common/BehaviourState';
import * as Fields from '../data/Fields';
import { EventFormat, NativeSimulatedEvent, SimulatedEvent } from '../events/SimulatedEvent';
import { inSet } from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import { FocusInsideModes, GeneralKeyingConfig } from './KeyingModeTypes';

type GetRulesFunc<C extends GeneralKeyingConfig, S extends BehaviourState> = (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventArgs>, keyingConfig: C, keyingState: S) => Array<KeyRules.KeyRule<C, S>>;

const typical = <C extends GeneralKeyingConfig, S extends BehaviourState>(
  infoSchema: FieldProcessorAdt[],
  stateInit: (config: C) => BehaviourState,
  getKeydownRules: (comp: AlloyComponent, se: NativeSimulatedEvent, config: C, state: S) => Array<KeyRules.KeyRule<C, S>>,
  getKeyupRules: (comp: AlloyComponent, se: NativeSimulatedEvent, config: C, state: S) => Array<KeyRules.KeyRule<C, S>>,
  optFocusIn: (config: C) => Option<(comp: AlloyComponent, config: C, state: S) => void>) => {
  const schema = () => {
    return infoSchema.concat([
      FieldSchema.defaulted('focusManager', FocusManagers.dom()),
      FieldSchema.defaultedOf('focusInside', 'onFocus', ValueSchema.valueOf((val) => {
        return Arr.contains([ 'onFocus', 'onEnterOrSpace', 'onApi' ], val) ? Result.value(val) : Result.error('Invalid value for focusInside');
      })),
      Fields.output('handler', me),
      Fields.output('state', stateInit),
      Fields.output('sendFocusIn', optFocusIn)
    ]);
  };

  const processKey = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, getRules: GetRulesFunc<C, S>, keyingConfig: C, keyingState: S): Option<boolean> => {
    const rules = getRules(component, simulatedEvent, keyingConfig, keyingState);

    return KeyRules.choose(rules, simulatedEvent.event()).bind((rule) => {
      return rule(component, simulatedEvent, keyingConfig, keyingState);
    });
  };

  const toEvents = (keyingConfig: C, keyingState: S): AlloyEvents.AlloyEventRecord => {

    const onFocusHandler = keyingConfig.focusInside !== FocusInsideModes.OnFocusMode
      ? Option.none<AlloyEvents.AlloyEventKeyAndHandler<EventFormat>>()
      : optFocusIn(keyingConfig).map((focusIn) =>
        AlloyEvents.run<EventArgs>(SystemEvents.focus(), (component, simulatedEvent) => {
          focusIn(component, keyingConfig, keyingState);
          simulatedEvent.stop();
        }));

    // On enter or space on root element, if using EnterOrSpace focus mode, fire a focusIn on the component
    const tryGoInsideComponent = (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventArgs>) => {
      const isEnterOrSpace = inSet(Keys.SPACE().concat(Keys.ENTER()))(simulatedEvent.event());

      if (keyingConfig.focusInside === FocusInsideModes.OnEnterOrSpaceMode && isEnterOrSpace && EventRoot.isSource(component, simulatedEvent)) {
        optFocusIn(keyingConfig).each((focusIn) => {
          focusIn(component, keyingConfig, keyingState);
          simulatedEvent.stop();
        });
      }
    };

    return AlloyEvents.derive(
      onFocusHandler.toArray().concat([
        AlloyEvents.run<EventArgs>(NativeEvents.keydown(), (component, simulatedEvent) => {
          processKey(component, simulatedEvent, getKeydownRules, keyingConfig, keyingState).fold(
            () => {
              // Key wasn't handled ... so see if we should enter into the component (focusIn)
              tryGoInsideComponent(component, simulatedEvent);
            },
            (_) => {
              simulatedEvent.stop();
            }
          );
        }),
        AlloyEvents.run<EventArgs>(NativeEvents.keyup(), (component, simulatedEvent) => {
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
