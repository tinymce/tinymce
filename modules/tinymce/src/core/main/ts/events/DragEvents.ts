import { DataTransfer, DataTransferEvent, DataTransferMode } from '@ephox/dragster';
import { Fun, Type } from '@ephox/katamari';

import { EditorEvent } from '../api/util/EventDispatcher';

export type DragEventType = 'dragstart' | 'drop' | 'dragend';

const getTargetProps = (target: Element) => ({ target, srcElement: target });

const makeDndEventFromMouseEvent = (type: DragEventType, mouseEvent: EditorEvent<MouseEvent>, target: Element, dataTransfer: DataTransfer): DragEvent => ({
  ...mouseEvent,
  dataTransfer,
  type,
  ...getTargetProps(target)
});

const makeDndEvent = (type: DragEventType, target: Element, dataTransfer: DataTransfer): DragEvent => {
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

const makeDataTransferCopyForDragEvent = (dataTransfer: DataTransfer, eventType: DragEventType): DataTransfer => {
  const copy = DataTransfer.cloneDataTransfer(dataTransfer);
  // TINY-9601: Set mode as per https://html.spec.whatwg.org/dev/dnd.html#concept-dnd-rw
  if (eventType === 'dragstart') {
    DataTransferEvent.setDragstartEvent(copy);
    DataTransferMode.setReadWriteMode(copy);
  } else if (eventType === 'drop') {
    DataTransferEvent.setDropEvent(copy);
    DataTransferMode.setReadOnlyMode(copy);
  } else {
    DataTransferEvent.setDragendEvent(copy);
    DataTransferMode.setProtectedMode(copy);
  }
  return copy;
};

export const makeDragEvent = (type: DragEventType, target: Element, dataTransfer: DataTransfer, mouseEvent?: EditorEvent<MouseEvent>): DragEvent => {
  // TINY-9601: Get copy for each new event to prevent undesired mutations on dispatched DataTransfer objects
  const dataTransferForDispatch = makeDataTransferCopyForDragEvent(dataTransfer, type);
  return Type.isUndefined(mouseEvent) ? makeDndEvent(type, target, dataTransferForDispatch) : makeDndEventFromMouseEvent(type, mouseEvent, target, dataTransferForDispatch);
};
