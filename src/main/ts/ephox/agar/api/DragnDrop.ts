import { Step, Chain } from '@ephox/agar';
import { Options, Arr } from '@ephox/katamari';
import { SelectorFind, Body, Element, Node, Attr } from '@ephox/sugar';
import { dispatchDndEvent, createDragstartEvent, createDragEvent, createDragenterEvent, createDragoverEvent, createDropEvent, createDragendEvent, isDefaultPrevented } from '../dragndrop/DndEvents';
import { File, DragEvent } from '@ephox/dom-globals';
import { createDataTransfer, getDragImage } from '../datatransfer/DataTransfer';

const getWindowFromElement = (element: Element) => {
  return element.dom().ownerDocument.defaultView;
};

const isDraggable = (element: Element) => {
  if (Node.name(element) === 'img') {
    return true;
  } else if (Node.name(element) === 'a' && Attr.has(element, 'href')) {
    return true;
  } else if (Attr.get(element, 'draggable') === 'true') {
    return true;
  } else {
    return false;
  }
};

const checkDefaultPrevented = (evt: DragEvent) => {
  if (isDefaultPrevented(evt) === false) {
    throw new Error(`preventDefault was not called on drag event: ${evt.type}`);
  }
};

const dragAndDrop = (from: Element, to: Element) => {
  const fromWin = getWindowFromElement(from);
  const toWin = getWindowFromElement(to);
  const fromRect = from.dom().getBoundingClientRect();
  const toRect = from.dom().getBoundingClientRect();
  const transfer = createDataTransfer();

  if (isDraggable(from) === false) {
    throw new Error('Can not drag a non draggable element.');
  }

  dispatchDndEvent(createDragstartEvent(fromWin, fromRect.left, fromRect.top, transfer), from);
  dispatchDndEvent(createDragEvent(fromWin, fromRect.left, fromRect.top, transfer), from);
  checkDefaultPrevented(dispatchDndEvent(createDragenterEvent(toWin, toRect.left, toRect.top, transfer), to));
  checkDefaultPrevented(dispatchDndEvent(createDragoverEvent(toWin, toRect.left, toRect.top, transfer), to));
  checkDefaultPrevented(dispatchDndEvent(createDropEvent(toWin, toRect.left, toRect.top, transfer), to));
  dispatchDndEvent(createDragendEvent(fromWin, fromRect.left, fromRect.top, transfer), from);
};

const dropFilesOn = (files: File[], to: Element) => {
  const toWin = getWindowFromElement(to);
  const toRect = to.dom().getBoundingClientRect();
  const transfer = createDataTransfer();

  Arr.each(files, (file) => {
    transfer.items.add(file);
  });

  dispatchDndEvent(createDragenterEvent(toWin, toRect.left, toRect.top, transfer), to);
  dispatchDndEvent(createDragoverEvent(toWin, toRect.left, toRect.top, transfer), to);
  checkDefaultPrevented(dispatchDndEvent(createDropEvent(toWin, toRect.left, toRect.top, transfer), to));
}

const sSelectorDragAndDrop = (fromSelector: string, toSelector: string) => {
  return Step.sync(() => {
    Options.lift(
      SelectorFind.descendant(Body.body(), fromSelector),
      SelectorFind.descendant(Body.body(), toSelector),
      (from, to) => dragAndDrop(from, to)
    ).getOrDie('Could not find from/to elements.');
  });
};

const sSelectorDropFilesOn = (files: File[], toSelector: string) => {
  return Step.sync(() => {
    SelectorFind.descendant(Body.body(), toSelector).each((to) => dropFilesOn(files, to));
  });
};

const cDropFilesOn = (files: File[]) => Chain.on<Element, Element>((elm) => {
  dropFilesOn(files, elm);
});

export {
  dragAndDrop,
  dropFilesOn,
  sSelectorDragAndDrop,
  sSelectorDropFilesOn,
  cDropFilesOn,
  getDragImage
};
