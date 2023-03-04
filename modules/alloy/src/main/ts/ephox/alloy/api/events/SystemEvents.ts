import { Fun, Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarElement } from '@ephox/sugar';

import { CustomEvent } from '../../events/SimulatedEvent';
import { AlloyComponent } from '../component/ComponentApi';
import * as NativeEvents from './NativeEvents';

const prefixName = (name: string) => Fun.constant('alloy.' + name);

const alloy = { tap: prefixName('tap') };

// This is used to pass focus to a component. A component might interpret
// this event and pass the DOM focus to one of its children, depending on its
// focus model.
const focus = prefixName('focus');

// This event is fired a small amount of time after the blur has fired. This
// allows the handler to know what was the focused element, and what is now.
const postBlur = prefixName('blur.post');

// This event is fired a small amount of time after the paste event has fired.
const postPaste = prefixName('paste.post');

// This event is fired by gui.broadcast*. It is defined by 'receivers'
const receive = prefixName('receive');

// This event is for executing buttons and things that have (mostly) enter actions
const execute = prefixName('execute');

// This event is used by a menu to tell an item to focus itself because it has been
// selected. This might automatically focus inside the item, it might focus the outer
// part of the widget etc.
const focusItem = prefixName('focus.item');

// This event represents a touchstart and touchend on the same location, and fires on
// the touchend
const tap = alloy.tap;

/*
 * Tap event for touch device, otherwise click event
 * @deprecated
 */
const tapOrClick = (): string => PlatformDetection.detect().deviceType.isTouch() ? alloy.tap() : NativeEvents.click();

// This event represents a longpress on the same location
const longpress = prefixName('longpress');

// Fire by a child element to tell the outer element to close
const sandboxClose = prefixName('sandbox.close');

// Tell the typeahead to cancel any pending fetches (that haven't already executed)
const typeaheadCancel = prefixName('typeahead.cancel');

// Fired when adding to a world
const systemInit = prefixName('system.init');

// Fired when a touchmove on the document happens
const documentTouchmove = prefixName('system.touchmove');

// Fired when a touchend on the document happens
const documentTouchend = prefixName('system.touchend');

// Fired when the window scrolls
const windowScroll = prefixName('system.scroll');

// Fired when the window resizes
const windowResize = prefixName('system.resize');

const attachedToDom = prefixName('system.attached');
const detachedFromDom = prefixName('system.detached');

const dismissRequested = prefixName('system.dismissRequested');
const repositionRequested = prefixName('system.repositionRequested');

export interface AlloyFocusShiftedEvent extends CustomEvent {
  readonly prevFocus: Optional<SugarElement<HTMLElement>>;
  readonly newFocus: Optional<SugarElement<HTMLElement>>;
}

const focusShifted = prefixName('focusmanager.shifted');
// Fired when slots are made hidden/shown
const slotVisibility = prefixName('slotcontainer.visibility');

// Used for containers outside the mothership that scroll. Used by docking.
const externalElementScroll = prefixName('system.external.element.scroll');

export interface AlloySlotVisibilityEvent extends CustomEvent {
  readonly name: string;
  readonly visible: boolean;
}

export interface AlloyChangeTabEvent extends CustomEvent {
  readonly button: AlloyComponent;
}

export interface AlloyDismissTabEvent extends CustomEvent {
  readonly button: AlloyComponent;
}
const changeTab = prefixName('change.tab');
const dismissTab = prefixName('dismiss.tab');

const highlight = prefixName('highlight');
const dehighlight = prefixName('dehighlight');

export {

  focus,
  postBlur,
  postPaste,
  receive,
  execute,
  focusItem,
  tap,
  tapOrClick,
  longpress,
  sandboxClose,
  systemInit,
  typeaheadCancel,
  documentTouchmove,
  documentTouchend,
  windowScroll,
  windowResize,

  dismissRequested,
  repositionRequested,
  focusShifted,

  attachedToDom,
  detachedFromDom,

  changeTab,
  dismissTab,

  slotVisibility,
  externalElementScroll,

  highlight,
  dehighlight
};
