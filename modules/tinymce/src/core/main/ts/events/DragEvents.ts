import { Fun } from '@ephox/katamari';

import { EditorEvent } from '../api/util/EventDispatcher';

const getTargetProps = (target: Element) => ({ target, srcElement: target });

const makeDndEventFromMouseEvent = (type: string, mouseEvent: EditorEvent<MouseEvent>, target: Element, dataTransfer: DataTransfer | null): DragEvent => ({
  ...mouseEvent,
  dataTransfer,
  type,
  ...getTargetProps(target)
});

const makeDndEvent = (type: string, target: Element, dataTransfer: DataTransfer | null): DragEvent => {
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
    dataTransfer,

    ...getTargetProps(target)
  };

  return event;
};

const dndEvent = (type: string) => (target: Element, dataTransfer: DataTransfer | null): DragEvent => makeDndEvent(type, target, dataTransfer);
const dndEventFromMouseEvent = (type: string) => (mouseEvent: EditorEvent<MouseEvent>, target: Element, dataTransfer: DataTransfer | null): DragEvent =>
  makeDndEventFromMouseEvent(type, mouseEvent, target, dataTransfer);

export const makeDragstartEvent = dndEvent('dragstart');
export const makeDragstartEventFromMouseEvent = dndEventFromMouseEvent('dragstart');

export const makeDropEvent = dndEvent('drop');
export const makeDropEventFromMouseEvent = dndEventFromMouseEvent('drop');

export const makeDragendEvent = dndEvent('dragend');
export const makeDragendEventFromMouseEvent = dndEventFromMouseEvent('dragend');
