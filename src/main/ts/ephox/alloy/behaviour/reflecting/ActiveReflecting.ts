import { Arr } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { Attachment } from '../../api/Main';
import { ReceivingEvent } from '../../events/SimulatedEvent';
import { ReflectingConfig } from './ReflectingTypes';

const events = (reflectingConfig: ReflectingConfig/*, receiveState */) => {
  const update = (component: AlloyComponent, rawData: any) => {
    const preparedData = reflectingConfig.prepare()(component, rawData);
    // TODO: This is a simpler version of Replacing.set. Perhaps put something in alien?
    const newComponents = reflectingConfig.renderComponents()(preparedData);
    Attachment.detachChildren(component);
    Arr.each(newComponents, (c) => {
      Attachment.attach(component, component.getSystem().build(c));
    })
  }


  return AlloyEvents.derive([
    // FIX: Partial duplication of Replacing + Receiving
    AlloyEvents.run<ReceivingEvent>(SystemEvents.receive(), (component: AlloyComponent, message: any) => {
      const channel = reflectingConfig.channel();
      if (Arr.contains(message.channels(), channel)) {
        update(component, message.data());
      }
    }),

    AlloyEvents.runOnAttached((comp, se) => {
      reflectingConfig.initialData().each((rawData) => {
        update(comp, rawData);
      })
    })
  ]);
};

export {
  events
};