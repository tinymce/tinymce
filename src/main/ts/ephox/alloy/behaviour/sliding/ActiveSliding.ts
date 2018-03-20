import { Objects } from '@ephox/boulder';
import { Css } from '@ephox/sugar';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as DomModification from '../../dom/DomModification';
import * as SlidingApis from './SlidingApis';

const exhibit = function (base, slideConfig/*, slideState */) {
  const expanded = slideConfig.expanded();

  return expanded ? DomModification.nu({
    classes: [ slideConfig.openClass() ],
    styles: { }
  }) : DomModification.nu({
    classes: [ slideConfig.closedClass() ],
    styles: Objects.wrap(slideConfig.dimension().property(), '0px')
  });
};

const events = function (slideConfig, slideState) {
  return AlloyEvents.derive([
    AlloyEvents.run(NativeEvents.transitionend(), function (component, simulatedEvent) {
      const raw = simulatedEvent.event().raw();
      // This will fire for all transitions, we're only interested in the dimension completion
      if (raw.propertyName === slideConfig.dimension().property()) {
        SlidingApis.disableTransitions(component, slideConfig); // disable transitions immediately (Safari animates the dimension removal below)
        if (slideState.isExpanded()) { Css.remove(component.element(), slideConfig.dimension().property()); } // when showing, remove the dimension so it is responsive
        const notify = slideState.isExpanded() ? slideConfig.onGrown() : slideConfig.onShrunk();
        notify(component, simulatedEvent);
      }
    })
  ]);
};

export {
  exhibit,
  events
};