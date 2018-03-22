import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as FocusApis from './FocusApis';
import * as DomModification from '../../dom/DomModification';

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