import { Arr, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';

import { EventFormat, SimulatedEvent, NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { AlloyComponent } from '../../api/component/ComponentApi';

const events = (optAction: Option<(comp: AlloyComponent) => void>): AlloyEvents.AlloyEventRecord => {
  const executeHandler = (action) => {
    return AlloyEvents.run(SystemEvents.execute(), (component, simulatedEvent) => {
      action(component);
      simulatedEvent.stop();
    });
  };

  const onClick = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent): void => {
    simulatedEvent.stop();
    AlloyTriggers.emitExecute(component);
  };

  // Other mouse down listeners above this one should not get mousedown behaviour (like dragging)
  const onMousedown = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent): void => {
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