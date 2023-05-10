import { Arr } from '@ephox/katamari';
import { Attribute, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';

import { createDataTransfer, getDragImage } from '../datatransfer/DataTransfer';
import {
  createDragendEvent, createDragenterEvent, createDragEvent, createDragoverEvent, createDragstartEvent, createDropEvent, dispatchDndEvent,
  getWindowFromElement, isDefaultPrevented
} from '../dragndrop/DndEvents';
import { Chain } from './Chain';
import { NamedChain } from './NamedChain';
import { Step } from './Step';
import * as UiFinder from './UiFinder';

interface Item {
  data: string;
  type: string;
}

const isDraggable = (element: SugarElement<Element>): boolean => {
  const name = SugarNode.name(element);
  return (
    name === 'img' ||
    name === 'a' && Attribute.has(element, 'href') ||
    Attribute.get(element, 'draggable') === 'true'
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

const dragnDrop = (from: SugarElement<Element>, to: SugarElement<Element>, prevented: boolean = true): void => {
  const fromWin = getWindowFromElement(from);
  const toWin = getWindowFromElement(to);
  const fromRect = from.dom.getBoundingClientRect();
  const toRect = from.dom.getBoundingClientRect();
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

const drop = (to: SugarElement<Element>, prevented: boolean, addItems: (transfer: DataTransfer) => void): void => {
  const toWin = getWindowFromElement(to);
  const toRect = to.dom.getBoundingClientRect();
  const transfer = createDataTransfer();

  addItems(transfer);

  const check = prevented ? checkDefaultPrevented : checkNotDefaultPrevented;

  dispatchDndEvent(createDragenterEvent(toWin, toRect.left, toRect.top, transfer), to);
  dispatchDndEvent(createDragoverEvent(toWin, toRect.left, toRect.top, transfer), to);
  check(dispatchDndEvent(createDropEvent(toWin, toRect.left, toRect.top, transfer), to));
};

const dropFiles = (files: File[], to: SugarElement<Element>, prevented: boolean = true): void => {
  drop(to, prevented, (transfer) => {
    Arr.each(files, (file) => {
      transfer.items.add(file);
    });
  });
};

const dropItems = (items: Item[], to: SugarElement<Element>, prevented: boolean = true): void => {
  drop(to, prevented, (transfer) => {
    Arr.each(items, (item) => {
      transfer.items.add(item.data, item.type);
    });
  });
};

const cDragnDrop = <T extends Element> (fromSelector: string, toSelector: string, prevented?: boolean): Chain<SugarElement<T>, SugarElement<T>> => NamedChain.asChain([
  NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn(fromSelector), 'from'),
  NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn(toSelector), 'to'),
  Chain.op((obj) => dragnDrop(obj.from, obj.to, prevented)),
  NamedChain.output(NamedChain.inputName())
]);

const sDragnDrop = <T>(fromSelector: string, toSelector: string, prevented?: boolean): Step<T, T> =>
  Chain.asStep(SugarBody.body(), [ cDragnDrop(fromSelector, toSelector, prevented) ]);

const pDragnDrop = (fromSelector: string, toSelector: string, prevented?: boolean): Promise<SugarElement<HTMLElement>> =>
  Chain.toPromise(cDragnDrop<HTMLElement>(fromSelector, toSelector, prevented))(SugarBody.body());

const sDropFiles = <T>(files: File[], toSelector: string, prevented?: boolean): Step<T, T> => Chain.asStep(SugarBody.body(), [
  UiFinder.cFindIn(toSelector),
  cDropFiles(files, prevented)
]);

const cDropFiles = <T extends Element> (files: File[], prevented?: boolean): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op((elm) => {
    dropFiles(files, elm, prevented);
  });

const pDropFiles = <T extends Element> (elm: SugarElement<T>, files: File[], prevented?: boolean): Promise<SugarElement<T>> =>
  Chain.toPromise(cDropFiles<T>(files, prevented))(elm);

const sDropItems = <T> (items: Item[], toSelector: string, prevented?: boolean): Step<T, T> => Chain.asStep(SugarBody.body(), [
  UiFinder.cFindIn(toSelector),
  cDropItems(items, prevented)
]);

const cDropItems = <T extends Element> (items: Item[], prevented?: boolean): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op((elm) => {
    dropItems(items, elm, prevented);
  });

const pDropItems = <T extends Element> (elm: SugarElement<T>, items: Item[], prevented?: boolean): Promise<SugarElement<T>> =>
  Chain.toPromise(cDropItems<T>(items, prevented))(elm);

export {
  isDraggable,
  dragnDrop,
  dropFiles,
  dropItems,
  cDragnDrop,
  sDragnDrop,
  pDragnDrop,
  sDropFiles,
  cDropFiles,
  pDropFiles,
  sDropItems,
  cDropItems,
  pDropItems,
  getDragImage
};
