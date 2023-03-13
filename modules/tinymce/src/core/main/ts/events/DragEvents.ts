import { Fun } from '@ephox/katamari';

import { EditorEvent } from '../api/util/EventDispatcher';

const makeDndEventFromMouseEvent = <K extends keyof MouseEvent>(type: string, mouseEvent: EditorEvent<MouseEvent>, extra: Record<K, MouseEvent[K]>): DragEvent => ({
  ...mouseEvent,
  dataTransfer: null, // We are not supporting dataTransfer yet but DragEvent is MouseEvent + dataTransfer so the property should exist
  type,
  ...extra
});

const makeDndEvent = <K extends keyof DragEvent>(type: string, props: Record<K, DragEvent[K]>): DragEvent => {
  const fail = Fun.die('Function not supported on simulated event.');

  const event: DragEvent = {
    // Event
    bubbles: true,
    cancelBubble: false,
    cancelable: true,
    composed: false,
    currentTarget: null,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    returnValue: false,
    srcElement: null,
    target: null,
    timeStamp: 0,
    type,
    composedPath: fail,
    initEvent: fail,
    preventDefault: Fun.noop,
    stopImmediatePropagation: Fun.noop,
    stopPropagation: Fun.noop,
    AT_TARGET: window.Event.AT_TARGET,
    BUBBLING_PHASE: window.Event.BUBBLING_PHASE,
    CAPTURING_PHASE: window.Event.CAPTURING_PHASE,
    NONE: window.Event.NONE,

    // UIEvent
    altKey: false,
    button: 0,
    buttons: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    metaKey: false,
    movementX: 0,
    movementY: 0,
    offsetX: 0,
    offsetY: 0,
    pageX: 0,
    pageY: 0,
    relatedTarget: null,
    screenX: 0,
    screenY: 0,
    shiftKey: false,
    x: 0,
    y: 0,
    detail: 0,
    view: null,
    which: 0,
    initUIEvent: fail,
    initMouseEvent: fail,
    getModifierState: fail,

    // DragEvent
    dataTransfer: null, // We are not supporting dataTransfer yet but DragEvent is MouseEvent + dataTransfer so the property should exist

    ...props
  };

  return event;
};

const fallback = (target: Element) => ({ target, srcElement: target });

const dndEvent = (type: string) => (target: Element): DragEvent => makeDndEvent(type, fallback(target));
const dndEventFromMouseEvent = (type: string) => (mouseEvent: EditorEvent<MouseEvent>, target: Element): DragEvent =>
  makeDndEventFromMouseEvent(type, mouseEvent, fallback(target));

export const makeDragstartEvent = dndEvent('dragstart');
export const makeDragstartEventFromMouseEvent = dndEventFromMouseEvent('dragstart');

export const makeDropEvent = dndEvent('drop');
export const makeDropEventFromMouseEvent = dndEventFromMouseEvent('drop');

export const makeDragendEvent = dndEvent('dragend');
export const makeDragendEventFromMouseEvent = dndEventFromMouseEvent('dragend');

