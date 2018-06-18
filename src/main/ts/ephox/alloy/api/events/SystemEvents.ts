import * as NativeEvents from './NativeEvents';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { StringConstant } from '../../alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { CustomEvent } from '../../events/SimulatedEvent';

const alloy = { tap: Fun.constant('alloy.tap') };

// This is used to pass focus to a component. A component might interpret
// this event and pass the DOM focus to one of its children, depending on its
// focus model.
const focus = Fun.constant('alloy.focus') as StringConstant;

// This event is fired a small amount of time after the blur has fired. This
// allows the handler to know what was the focused element, and what is now.
const postBlur = Fun.constant('alloy.blur.post') as StringConstant;

// This event is fired by gui.broadcast*. It is defined by 'receivers'
const receive = Fun.constant('alloy.receive') as StringConstant;

// This event is for executing buttons and things that have (mostly) enter actions
const execute = Fun.constant('alloy.execute') as StringConstant;

// This event is used by a menu to tell an item to focus itself because it has been
// selected. This might automatically focus inside the item, it might focus the outer
// part of the widget etc.
const focusItem = Fun.constant('alloy.focus.item') as StringConstant;

// This event represents a touchstart and touchend on the same location, and fires on
// the touchend
const tap = alloy.tap as StringConstant;

// Tap event for touch device, otherwise click event
const tapOrClick = PlatformDetection.detect().deviceType.isTouch() ? alloy.tap : NativeEvents.click;

// This event represents a longpress on the same location
const longpress = Fun.constant('alloy.longpress') as StringConstant;

// Fire by a child element to tell the outer element to close
const sandboxClose = Fun.constant('alloy.sandbox.close') as StringConstant;

// Fired when adding to a world
const systemInit = Fun.constant('alloy.system.init') as StringConstant;

// Fired when the window scrolls
const windowScroll = Fun.constant('alloy.system.scroll') as StringConstant;

const attachedToDom = Fun.constant('alloy.system.attached') as StringConstant;
const detachedFromDom = Fun.constant('alloy.system.detached') as StringConstant;

export interface AlloyChangeTabEvent extends CustomEvent {
  button: () => AlloyComponent;
}

export interface AlloyDismissTabEvent extends CustomEvent {
  button: () => AlloyComponent;
}
const changeTab = Fun.constant('alloy.change.tab') as StringConstant;
const dismissTab = Fun.constant('alloy.dismiss.tab') as StringConstant;

export {

  focus,
  postBlur,
  receive,
  execute,
  focusItem,
  tap,
  tapOrClick,
  longpress,
  sandboxClose,
  systemInit,
  windowScroll,

  attachedToDom,
  detachedFromDom,

  changeTab,
  dismissTab
};