import { CustomEvent, EventFormat } from '@ephox/alloy';
import { Id } from '@ephox/katamari';

// We also could have put the SearcherState in here, but that makes refetch
// a searcher-specific event, which we probably don't want. But maybe that's
// unnecessary generalisation.
export interface RefetchTriggerEventData { }

export interface RefetchTriggerEvent extends CustomEvent, RefetchTriggerEventData { }

export interface RedirectMenuItemInteractionEventData {
  readonly eventType: string;
  readonly interactionEvent: EventFormat;
}

export interface RedirectMenuItemInteractionEvent extends CustomEvent, RedirectMenuItemInteractionEventData { }

// This event is triggered by a menu item from a dropdown when it wants the
// dropdown to refetch its contents based on a search string.
const refetchTriggerEvent = Id.generate('refetch-trigger-event');

// This event is triggerd by a menu item from a dropdown, when it wants to
// redispatch that event to the currently active item of that dropdown menu. It will
// be used in situations where the event should be firing on the item with fake focus,
// but instead it is firing on the item with real focus (e.g of real focus:
// menu search field)
const redirectMenuItemInteractionEvent = Id.generate('redirect-menu-item-interaction');

export {
  refetchTriggerEvent,
  redirectMenuItemInteractionEvent
};
