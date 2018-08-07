import { Arr } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { Attachment } from '../../api/Main';
import { ReceivingEvent } from '../../events/SimulatedEvent';
import { ReflectingConfig } from './ReflectingTypes';

const events = (reflectingConfig: ReflectingConfig/*, receiveState */) => {
  return AlloyEvents.derive([
    // FIX: Partial duplication of Replacing + Receiving
    AlloyEvents.run<ReceivingEvent>(SystemEvents.receive(), (component: AlloyComponent, message: any) => {
      const channel = reflectingConfig.channel();
      const data = reflectingConfig.prepare()(message.data());
      if (Arr.contains(message.channels(), channel)) {
        // TODO: This is a simpler version of Replacing.set. Perhaps put something in alien?
        const newComponents = reflectingConfig.renderComponents()(data);
        Attachment.detachChildren(component);
        Arr.each(newComponents, (c) => {
          Attachment.attach(component, component.getSystem().build(c));
        })
      }
    })
  ]);
};

export {
  events
};