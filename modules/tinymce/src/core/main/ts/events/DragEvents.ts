import { Fun } from '@ephox/katamari';

import { EditorEvent } from '../api/util/EventDispatcher';

const makeDragEventFromMouseEvent = <K extends keyof MouseEvent>(type: string, mouseEvent: EditorEvent<MouseEvent>, extra: Record<K, MouseEvent[K]>): DragEvent => ({
  ...mouseEvent,
  dataTransfer: null, // We are not supporting dataTransfer yet but DragEvent is MouseEvent + dataTransfer so the properly should exist
  type,
  ...extra
});

const makeDragEvent = <K extends keyof DragEvent>(type: string, props: Record<K, DragEvent[K]>): DragEvent => {
  const fail = () => {
    throw new Error('Function not supported on simulated event.');
  };

  const mutate = <K extends keyof DragEvent>(key: K, value: DragEvent[K]) => {
    const mutableEvent = event as unknown as Record<K, DragEvent[K]>;
    mutableEvent[key] = value;
  };

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
    preventDefault: () => mutate('defaultPrevented', true),
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
    dataTransfer: null,

    ...props
  };

  return event;
};

const fallback = (target: HTMLElement) => ({ target, srcElement: target });

const makeDndEvent = (type: string) => (target: HTMLElement): DragEvent => makeDragEvent(type, fallback(target));
const makeDndEventFromMouseEvent = (type: string) => (mouseEvent: EditorEvent<MouseEvent>, target: HTMLElement): DragEvent =>
  makeDragEventFromMouseEvent(type, mouseEvent, fallback(target));

export const makeDragstartEvent = makeDndEvent('dragstart');
export const makeDragstartEventFromMouseEvent = makeDndEventFromMouseEvent('dragstart');

export const makeDropEvent = makeDndEvent('drop');
export const makeDropEventFromMouseEvent = makeDndEventFromMouseEvent('drop');

export const makeDragendEvent = makeDndEvent('dragend');
export const makeDragendEventFromMouseEvent = makeDndEventFromMouseEvent('dragend');

