import { Arr, Option } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { ButtonAction } from '../types/ButtonTypes';

const pointerEvents = (): Array<AlloyEvents.AlloyEventKeyAndHandler<EventArgs>> => {
  const onClick = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => {
    simulatedEvent.stop();
    AlloyTriggers.emitExecute(component);
  };

  return [
    // Trigger execute when clicked
    AlloyEvents.run(NativeEvents.click(), onClick),
    AlloyEvents.run(SystemEvents.tap(), onClick),

    // Other mouse down listeners above this one should not get mousedown behaviour (like dragging)
    AlloyEvents.cutter(NativeEvents.touchstart()),
    AlloyEvents.cutter(NativeEvents.mousedown())
  ];
};

const events = (optAction: Option<(comp: AlloyComponent) => void>): AlloyEvents.AlloyEventRecord => {
  const executeHandler = (action: ButtonAction) => {
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
