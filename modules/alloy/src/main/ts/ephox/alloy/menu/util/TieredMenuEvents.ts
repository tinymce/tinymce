import { Id } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { CustomEvent } from '../../events/SimulatedEvent';

// The primary purpose of these events is to bubble up to the tiered menu,
// and allow the tiered menu handlers to have a reference to
// all of the tiered menu, the active menu, and the item comp
// when firing their handlers (like onHighlightItem)
export interface OnMenuItemHighlightedEventData {
  readonly menuComp: AlloyComponent;
  readonly itemComp: AlloyComponent;
}

export interface OnMenuItemHighlightedEvent extends CustomEvent, OnMenuItemHighlightedEventData { }

export interface OnMenuItemDehighlightedEventData {
  readonly menuComp: AlloyComponent;
  readonly itemComp: AlloyComponent;
}

export interface OnMenuItemDehighlightedEvent extends CustomEvent, OnMenuItemDehighlightedEventData { }

const onMenuItemHighlightedEvent = Id.generate('tiered-menu-item-highlight');
const onMenuItemDehighlightedEvent = Id.generate('tiered-menu-item-dehighlight');

export {
  onMenuItemHighlightedEvent,
  onMenuItemDehighlightedEvent
};
