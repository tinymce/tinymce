import { Chain, UiFinder, NamedChain } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Body, Element, Node, Attr } from '@ephox/sugar';
import {
  dispatchDndEvent,
  createDragstartEvent,
  createDragEvent,
  createDragenterEvent,
  createDragoverEvent,
  createDropEvent,
  createDragendEvent,
  isDefaultPrevented,
  getWindowFromElement
} from '../dragndrop/DndEvents';
import { File, DragEvent } from '@ephox/dom-globals';
import { createDataTransfer, getDragImage } from '../datatransfer/DataTransfer';
import { Step } from './Step';

const isDraggable = (element: Element<any>): boolean => {
  const name = Node.name(element);
  return (
    name === 'img' ||
    name === 'a' && Attr.has(element, 'href') ||
    Attr.get(element, 'draggable') === 'true'
  );
};

const checkDefaultPrevented = (evt: DragEvent): void => {
  if (isDefaultPrevented(evt) === false) {
    throw new Error(`preventDefault was not called on drag event: ${evt.type}`);
  }
};

const dragnDrop = (from: Element<any>, to: Element<any>): void => {
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

const dropFiles = (files: File[], to: Element<any>): void => {
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

const cDragnDrop = <T> (fromSelector: string, toSelector: string): Chain<Element<T>, Element<T>> => {
  return NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn(fromSelector), 'from'),
    NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn(toSelector), 'to'),
    Chain.op((obj) => dragnDrop(obj.from, obj.to)),
    NamedChain.output(NamedChain.inputName())
  ]);
};

const sDragnDrop = <T>(fromSelector: string, toSelector: string): Step<T, T> =>
  Chain.asStep(Body.body(), [cDragnDrop(fromSelector, toSelector)]);

const sDropFiles = <T>(files: File[], toSelector: string): Step<T, T> => {
  return Chain.asStep(Body.body(), [
    UiFinder.cFindIn(toSelector),
    cDropFiles(files)
  ]);
};

const cDropFiles = <T> (files: File[]): Chain<Element<T>, Element<T>> =>
  Chain.op((elm) => {
    dropFiles(files, elm);
  });

export {
  isDraggable,
  dragnDrop,
  dropFiles,
  cDragnDrop,
  sDragnDrop,
  sDropFiles,
  cDropFiles,
  getDragImage
};
