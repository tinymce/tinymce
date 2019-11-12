import { Arr, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { EventFormat } from '../../events/SimulatedEvent';

const pointerEvents = (): Array<AlloyEvents.AlloyEventKeyAndHandler<EventFormat>> => {
  return [
    // Trigger execute when clicked
    AlloyEvents.run(SystemEvents.tapOrClick(), (component, simulatedEvent) => {
      simulatedEvent.stop();
      AlloyTriggers.emitExecute(component);
    }),

    // Other mouse down listeners above this one should not get mousedown behaviour (like dragging)
    AlloyEvents.cutter(PlatformDetection.detect().deviceType.isTouch() ? NativeEvents.touchstart() : NativeEvents.mousedown())
  ];
};

const events = (optAction: Option<(comp: AlloyComponent) => void>): AlloyEvents.AlloyEventRecord => {
  const executeHandler = (action) => {
    return AlloyEvents.runOnExecute((component, simulatedEvent) => {
      action(component);
      simulatedEvent.stop();
    });
  };

  return AlloyEvents.derive(
    Arr.flatten([
      // Only listen to execute if it is supplied
      optAction.map(executeHandler).toArray(),
      pointerEvents()
    ])
  );
};

export {
  pointerEvents,
  events
};
