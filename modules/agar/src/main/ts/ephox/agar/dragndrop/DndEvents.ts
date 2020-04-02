import { document, Window, DataTransfer, DragEvent } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';
import { setReadWriteMode, setReadOnlyMode, setProtectedMode } from '../datatransfer/Mode';
import { PlatformDetection } from '@ephox/sand';

const platform = PlatformDetection.detect();

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

  // IE doesn't update the defaultPrevented state for some reason
  // and it's read only so we need to have a different property
  if (platform.browser.isIE()) {
    const orgPreventDefault = event.preventDefault;
    event.preventDefault = () => {
      event.ieDefaultPrevented = true;
      orgPreventDefault.call(event);
    };
  }

  return event;
};

const createDragoverEvent = createDndEvent('dragover');
const createDragendEvent = createDndEvent('dragend');
const createDragstartEvent = createDndEvent('dragstart');
const createDragleaveEvent = createDndEvent('dragleave');
const createDragenterEvent = createDndEvent('dragenter');
const createDropEvent = createDndEvent('drop');
const createDragEvent = createDndEvent('drag');

const isDefaultPrevented = (evt: DragEvent): boolean => evt.defaultPrevented || evt.hasOwnProperty('ieDefaultPrevented');

const dispatchDndEvent = (event: DragEvent, target: Element<any>): DragEvent => {
  if (event.type === 'dragstart') {
    setReadWriteMode(event.dataTransfer);
  } else if (event.type === 'drop') {
    setReadOnlyMode(event.dataTransfer);
  } else {
    setProtectedMode(event.dataTransfer);
  }

  target.dom().dispatchEvent(event);

  return event;
};

const getWindowFromElement = (element: Element<any>): Window => element.dom().ownerDocument.defaultView;

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
