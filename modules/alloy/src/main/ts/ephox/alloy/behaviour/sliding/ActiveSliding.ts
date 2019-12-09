import { Objects } from '@ephox/boulder';
import { TransitionEvent } from '@ephox/dom-globals';
import { Css, EventArgs } from '@ephox/sugar';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import * as SlidingApis from './SlidingApis';
import { SlidingConfig, SlidingState } from './SlidingTypes';

const exhibit = (base: DomDefinitionDetail, slideConfig: SlidingConfig/*, slideState */) => {
  const expanded = slideConfig.expanded;

  return expanded ? DomModification.nu({
    classes: [ slideConfig.openClass ],
    styles: { }
  }) : DomModification.nu({
    classes: [ slideConfig.closedClass ],
    styles: Objects.wrap(slideConfig.dimension.property, '0px')
  });
};

const events = (slideConfig: SlidingConfig, slideState: SlidingState): AlloyEvents.AlloyEventRecord => {
  return AlloyEvents.derive([
    AlloyEvents.runOnSource<EventArgs>(NativeEvents.transitionend(), (component, simulatedEvent) => {
      const raw = simulatedEvent.event().raw() as TransitionEvent;
      // This will fire for all transitions, we're only interested in the dimension completion on source
      if (raw.propertyName === slideConfig.dimension.property) {
        SlidingApis.disableTransitions(component, slideConfig); // disable transitions immediately (Safari animates the dimension removal below)
        if (slideState.isExpanded()) { Css.remove(component.element(), slideConfig.dimension.property); } // when showing, remove the dimension so it is responsive
        const notify = slideState.isExpanded() ? slideConfig.onGrown : slideConfig.onShrunk;
        notify(component);
      }
    })
  ]);
};

export {
  exhibit,
  events
};
