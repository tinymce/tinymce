import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as FocusApis from './FocusApis';
import * as DomModification from '../../dom/DomModification';
import { FocusingConfig } from '../../behaviour/focusing/FocusingTypes';
import { EventFormat } from '../../events/SimulatedEvent';

// TODO: DomModification types
const exhibit = (base: { }, focusConfig: FocusingConfig): any => {
  if (focusConfig.ignore()) { return DomModification.nu({ }); } else { return DomModification.nu({
    attributes: {
      tabindex: '-1'
    }
  });
  }
};

const events = (focusConfig: FocusingConfig) : AlloyEvents.EventHandlerConfigRecord => {
  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.focus(), (component, simulatedEvent) => {
      FocusApis.focus(component, focusConfig);
      simulatedEvent.stop();
    })
  ]);
};

export {
  exhibit,
  events
};