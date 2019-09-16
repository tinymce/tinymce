import { Arr } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { ReceivingEvent } from '../../events/SimulatedEvent';
import * as InternalAttachment from '../../system/InternalAttachment';
import { ReflectingConfig, ReflectingState } from './ReflectingTypes';

const events = <I, S>(reflectingConfig: ReflectingConfig<I, S>, reflectingState: ReflectingState<S>) => {
  const update = (component: AlloyComponent, data: I) => {
    reflectingConfig.updateState.each((updateState) => {
      const newState = updateState(component, data);
      reflectingState.set(newState);
    });

    // FIX: Partial duplication of Replacing + Receiving
    reflectingConfig.renderComponents.each((renderComponents) => {
      const newComponents = renderComponents(data, reflectingState.get());
      const newChildren = Arr.map(newComponents, component.getSystem().build);
      InternalAttachment.replaceChildren(component, newChildren);
    });
  };

  return AlloyEvents.derive([

    AlloyEvents.run<ReceivingEvent>(SystemEvents.receive(), (component: AlloyComponent, message: any) => {
      const channel = reflectingConfig.channel;
      if (Arr.contains(message.channels(), channel)) {
        update(component, message.data());
      }
    }),

    AlloyEvents.runOnAttached((comp, se) => {
      reflectingConfig.initialData.each((rawData) => {
        update(comp, rawData);
      });
    })
  ]);
};

export {
  events
};
