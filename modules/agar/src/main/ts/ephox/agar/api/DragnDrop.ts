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
import { File, DragEvent, DataTransfer } from '@ephox/dom-globals';
import { createDataTransfer, getDragImage } from '../datatransfer/DataTransfer';
import { Step } from './Step';

interface Item {
  data: string;
  type: string;
}

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

const checkNotDefaultPrevented = (evt: DragEvent): void => {
  if (isDefaultPrevented(evt) === true) {
    throw new Error(`preventDefault was called on drag event: ${evt.type}`);
  }
};

const dragnDrop = (from: Element<any>, to: Element<any>, prevented: boolean = true): void => {
  const fromWin = getWindowFromElement(from);
  const toWin = getWindowFromElement(to);
  const fromRect = from.dom().getBoundingClientRect();
  const toRect = from.dom().getBoundingClientRect();
  const transfer = createDataTransfer();

  if (isDraggable(from) === false) {
    throw new Error('Can not drag a non draggable element.');
  }

  const check = prevented ? checkDefaultPrevented : checkNotDefaultPrevented;

  dispatchDndEvent(createDragstartEvent(fromWin, fromRect.left, fromRect.top, transfer), from);
  dispatchDndEvent(createDragEvent(fromWin, fromRect.left, fromRect.top, transfer), from);
  check(dispatchDndEvent(createDragenterEvent(toWin, toRect.left, toRect.top, transfer), to));
  check(dispatchDndEvent(createDragoverEvent(toWin, toRect.left, toRect.top, transfer), to));
  check(dispatchDndEvent(createDropEvent(toWin, toRect.left, toRect.top, transfer), to));
  dispatchDndEvent(createDragendEvent(fromWin, fromRect.left, fromRect.top, transfer), from);
};

const drop = (to: Element<any>, prevented: boolean, addItems: (transfer: DataTransfer) => void): void => {
  const toWin = getWindowFromElement(to);
  const toRect = to.dom().getBoundingClientRect();
  const transfer = createDataTransfer();

  addItems(transfer);

  const check = prevented ? checkDefaultPrevented : checkNotDefaultPrevented;

  dispatchDndEvent(createDragenterEvent(toWin, toRect.left, toRect.top, transfer), to);
  dispatchDndEvent(createDragoverEvent(toWin, toRect.left, toRect.top, transfer), to);
  check(dispatchDndEvent(createDropEvent(toWin, toRect.left, toRect.top, transfer), to));
};

const dropFiles = (files: File[], to: Element<any>, prevented: boolean = true): void => {
  drop(to, prevented, (transfer) => {
    Arr.each(files, (file) => {
      transfer.items.add(file);
    });
  });
};

const dropItems = (items: Item[], to: Element<any>, prevented: boolean = true): void => {
  drop(to, prevented, (transfer) => {
    Arr.each(items, (item) => {
      transfer.items.add(item.data, item.type);
    });
  });
};

const cDragnDrop = <T> (fromSelector: string, toSelector: string, prevented?: boolean): Chain<Element<T>, Element<T>> => NamedChain.asChain([
  NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn(fromSelector), 'from'),
  NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn(toSelector), 'to'),
  Chain.op((obj) => dragnDrop(obj.from, obj.to, prevented)),
  NamedChain.output(NamedChain.inputName())
]);

const sDragnDrop = <T>(fromSelector: string, toSelector: string, prevented?: boolean): Step<T, T> =>
  Chain.asStep(Body.body(), [ cDragnDrop(fromSelector, toSelector, prevented) ]);

const sDropFiles = <T>(files: File[], toSelector: string, prevented?: boolean): Step<T, T> => Chain.asStep(Body.body(), [
  UiFinder.cFindIn(toSelector),
  cDropFiles(files, prevented)
]);

const cDropFiles = <T> (files: File[], prevented?: boolean): Chain<Element<T>, Element<T>> =>
  Chain.op((elm) => {
    dropFiles(files, elm, prevented);
  });

const sDropItems = <T> (items: Item[], toSelector: string, prevented?: boolean): Step<T, T> => Chain.asStep(Body.body(), [
  UiFinder.cFindIn(toSelector),
  cDropItems(items, prevented)
]);

const cDropItems = <T> (items: Item[], prevented?: boolean): Chain<Element<T>, Element<T>> =>
  Chain.op((elm) => {
    dropItems(items, elm, prevented);
  });

export {
  isDraggable,
  dragnDrop,
  dropFiles,
  dropItems,
  cDragnDrop,
  sDragnDrop,
  sDropFiles,
  cDropFiles,
  sDropItems,
  cDropItems,
  getDragImage
};
