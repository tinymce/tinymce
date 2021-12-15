import { Arr } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { ReceivingEvent, ReceivingInternalEvent } from '../../events/SimulatedEvent';
import { withoutReuse, withReuse } from '../replacing/ReplacingAll';
import { ReflectingConfig, ReflectingState } from './ReflectingTypes';

const events = <I, S>(reflectingConfig: ReflectingConfig<I, S>, reflectingState: ReflectingState<S>): AlloyEvents.AlloyEventRecord => {
  const update = (component: AlloyComponent, data: I) => {
    reflectingConfig.updateState.each((updateState) => {
      const newState = updateState(component, data);
      reflectingState.set(newState);
    });

    // FIX: Partial duplication of Replacing + Receiving
    reflectingConfig.renderComponents.each((renderComponents) => {
      const newComponents = renderComponents(data, reflectingState.get());

      const replacer = reflectingConfig.reuseDom ? withReuse : withoutReuse;
      replacer(component, newComponents);
    });
  };

  return AlloyEvents.derive([
    AlloyEvents.run<ReceivingEvent>(SystemEvents.receive(), (component, message) => {
      // NOTE: Receiving event ignores the whole simulated event part.
      // TODO: Think about the types for this, or find a better way for this to rely on receiving.
      const receivingData = message as unknown as ReceivingInternalEvent;
      if (!receivingData.universal) {
        const channel = reflectingConfig.channel;
        if (Arr.contains(receivingData.channels, channel)) {
          update(component, receivingData.data);
        }
      }
    }),

    AlloyEvents.runOnAttached((comp, _se) => {
      reflectingConfig.initialData.each((rawData) => {
        update(comp, rawData);
      });
    })
  ]);
};

export {
  events
};
