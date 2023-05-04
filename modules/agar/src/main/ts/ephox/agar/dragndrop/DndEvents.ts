import { DataTransferMode } from '@ephox/dragster';
import { SugarElement } from '@ephox/sugar';

const createDndEvent = (name: string) => (win: Window, x: number, y: number, dataTransfer: DataTransfer): DragEvent => {
  const event: any = document.createEvent('CustomEvent');
  event.initCustomEvent(name, true, true, null);

  event.view = win;
  event.ctrlKey = false;
  event.altKey = false;
  event.shiftKey = false;
  event.metaKey = false;
  event.button = 0;
  event.relatedTarget = null;
  event.screenX = win.screenX + x;
  event.screenY = win.screenY + y;
  event.dataTransfer = dataTransfer;

  return event;
};

const createDragoverEvent = createDndEvent('dragover');
const createDragendEvent = createDndEvent('dragend');
const createDragstartEvent = createDndEvent('dragstart');
const createDragleaveEvent = createDndEvent('dragleave');
const createDragenterEvent = createDndEvent('dragenter');
const createDropEvent = createDndEvent('drop');
const createDragEvent = createDndEvent('drag');

const isDefaultPrevented = (evt: DragEvent): boolean => evt.defaultPrevented;

const dispatchDndEvent = (event: DragEvent, target: SugarElement<Node>): DragEvent => {
  if (event.type === 'dragstart') {
    DataTransferMode.setReadWriteMode(event.dataTransfer);
  } else if (event.type === 'drop') {
    DataTransferMode.setReadOnlyMode(event.dataTransfer);
  } else {
    DataTransferMode.setProtectedMode(event.dataTransfer);
  }

  target.dom.dispatchEvent(event);

  return event;
};

const getWindowFromElement = (element: SugarElement<Element>): Window => element.dom.ownerDocument.defaultView;

export {
  createDndEvent,
  createDragoverEvent,
  createDragendEvent,
  createDragstartEvent,
  createDragleaveEvent,
  createDragenterEvent,
  createDropEvent,
  createDragEvent,
  isDefaultPrevented,
  dispatchDndEvent,
  getWindowFromElement
};
