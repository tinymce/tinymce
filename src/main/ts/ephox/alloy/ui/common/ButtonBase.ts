import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';

import { EventFormat } from '../../events/SimulatedEvent';

const events = (optAction) => {
  const executeHandler = (action) => {
    return AlloyEvents.run(SystemEvents.execute(), (component, simulatedEvent) => {
      action(component);
      simulatedEvent.stop();
    });
  };

  const onClick = (component, simulatedEvent) => {
    simulatedEvent.stop();
    AlloyTriggers.emitExecute(component);
  };

  // Other mouse down listeners above this one should not get mousedown behaviour (like dragging)
  const onMousedown = (component, simulatedEvent) => {
    simulatedEvent.cut();
  };

  const pointerEvents = PlatformDetection.detect().deviceType.isTouch() ? [
    AlloyEvents.run(SystemEvents.tap(), onClick)
  ] : [
    AlloyEvents.run(NativeEvents.click(), onClick),
    AlloyEvents.run(NativeEvents.mousedown(), onMousedown)
  ];

  return AlloyEvents.derive(
    Arr.flatten([
      // Only listen to execute if it is supplied
      optAction.map(executeHandler).toArray(),
      pointerEvents
    ])
  );
};

export {
  events
};