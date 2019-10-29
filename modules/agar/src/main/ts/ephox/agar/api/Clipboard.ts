import { File, DataTransfer } from '@ephox/dom-globals';
import { Chain } from './Chain';
import { cFindIn } from './UiFinder';
import { Body, Element } from '@ephox/sugar';
import { getWindowFromElement } from '../dragndrop/DndEvents';
import { createDataTransfer } from '../datatransfer/DataTransfer';
import { Arr, Obj } from '@ephox/katamari';
import { createPasteEvent, createCopyEvent, createCutEvent } from '../clipboard/ClipboardEvents';
import { Step } from './Step';
import * as ChainSequence from './ChainSequence';

const cPasteDataTransfer = (mutator: (dataTransfer: DataTransfer) => void): Chain<Element<any>, Element<any>> =>
  Chain.op<Element<any>>((target) => {
    const win = getWindowFromElement(target);
    const dataTransfer = createDataTransfer();
    const event = createPasteEvent(win, 0, 0, dataTransfer);

    mutator(dataTransfer);

    target.dom().dispatchEvent(event);
  });

const cPasteItems = (items: Record<string, string>): Chain<Element<any>, Element<any>> =>
  cPasteDataTransfer((dataTransfer) => {
    Obj.each(items, (data, mime) => {
      dataTransfer.setData(mime, data);
    });
  });

const cPasteFiles = (files: File[]): Chain<Element<any>, Element<any>> =>
  cPasteDataTransfer((dataTransfer) => {
    Arr.each(files, (file) => {
      dataTransfer.items.add(file);
    });
  });

const sPasteDataTransfer = <T>(mutator: (dataTransfer: DataTransfer) => void, selector: string): Step<T, T> =>
  Chain.isolate({}, ChainSequence.sequence([
    Chain.injectThunked(Body.body),
    cFindIn(selector),
    cPasteDataTransfer(mutator)
  ]));

const sPasteItems = <T>(items: Record<string, string>, selector: string): Step<T, T> =>
  Chain.isolate({}, ChainSequence.sequence([
    Chain.injectThunked(Body.body),
    cFindIn(selector),
    cPasteItems(items)
  ]));

const sPasteFiles = <T>(files: File[], selector: string): Step<T, T> =>
  Chain.isolate({}, ChainSequence.sequence([
    Chain.injectThunked(Body.body),
    cFindIn(selector),
    cPasteFiles(files)
  ]));

const cCut: Chain<Element<any>, DataTransfer> =
  Chain.mapper<Element<any>, DataTransfer>((target) => {
    const win = getWindowFromElement(target);
    const dataTransfer = createDataTransfer();
    const event = createCutEvent(win, 0, 0, dataTransfer);

    target.dom().dispatchEvent(event);

    return dataTransfer;
  });

const cCopy: Chain<Element<any>, DataTransfer> =
  Chain.mapper<Element, DataTransfer>((target) => {
    const win = getWindowFromElement(target);
    const dataTransfer = createDataTransfer();
    const event = createCopyEvent(win, 0, 0, dataTransfer);

    target.dom().dispatchEvent(event);

    return dataTransfer;
  });

export {
  cPasteDataTransfer,
  cPasteItems,
  cPasteFiles,
  sPasteDataTransfer,
  sPasteItems,
  sPasteFiles,
  cCut,
  cCopy
};
