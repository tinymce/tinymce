import * as AlloyEvents from '../../api/events/AlloyEvents';
import SystemEvents from '../../api/events/SystemEvents';
import FocusApis from './FocusApis';
import DomModification from '../../dom/DomModification';

const exhibit = function (base, focusConfig) {
  if (focusConfig.ignore()) { return DomModification.nu({ }); } else { return DomModification.nu({
    attributes: {
      tabindex: '-1'
    }
  });
  }
};

const events = function (focusConfig) {
  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.focus(), function (component, simulatedEvent) {
      FocusApis.focus(component, focusConfig);
      simulatedEvent.stop();
    })
  ]);
};

export {
  exhibit,
  events
};