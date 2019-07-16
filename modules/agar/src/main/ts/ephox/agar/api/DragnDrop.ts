import { Chain, UiFinder, NamedChain } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Body, Element, Node, Attr } from '@ephox/sugar';
import { dispatchDndEvent, createDragstartEvent, createDragEvent, createDragenterEvent, createDragoverEvent, createDropEvent, createDragendEvent, isDefaultPrevented, getWindowFromElement } from '../dragndrop/DndEvents';
import { File, DragEvent } from '@ephox/dom-globals';
import { createDataTransfer, getDragImage } from '../datatransfer/DataTransfer';

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

const dragnDrop = (from: Element, to: Element) => {
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

const dropFiles = (files: File[], to: Element) => {
  const toWin = getWindowFromElement(to);
  const toRect = to.dom().getBoundingClientRect();
  const transfer = createDataTransfer();

  Arr.each(files, (file) => {
    transfer.items.add(file);
  });

  dispatchDndEvent(createDragenterEvent(toWin, toRect.left, toRect.top, transfer), to);
  dispatchDndEvent(createDragoverEvent(toWin, toRect.left, toRect.top, transfer), to);
  checkDefaultPrevented(dispatchDndEvent(createDropEvent(toWin, toRect.left, toRect.top, transfer), to));
};

const cDragnDrop = (fromSelector: string, toSelector: string): Chain<Element, Element> => {
  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn(fromSelector), 'from'),
    NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn(toSelector), 'to'),
    Chain.op((obj) => dragnDrop(obj.from, obj.to)),
    NamedChain.output(NamedChain.inputName())
  ]);
};

const sDragnDrop = (fromSelector: string, toSelector: string) => {
  return Chain.asStep(Body.body(), [ cDragnDrop(fromSelector, toSelector) ]);
};

const sDropFiles = (files: File[], toSelector: string) => {
  return Chain.asStep(Body.body(), [
    UiFinder.cFindIn(toSelector),
    cDropFiles(files)
  ]);
};

const cDropFiles = (files: File[]) => Chain.op<Element>((elm) => {
  dropFiles(files, elm);
});

export {
  dragnDrop,
  dropFiles,
  cDragnDrop,
  sDragnDrop,
  sDropFiles,
  cDropFiles,
  getDragImage
};
