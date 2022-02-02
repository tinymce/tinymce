import { Arr, Obj } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';

import { createCopyEvent, createCutEvent, createPasteEvent } from '../clipboard/ClipboardEvents';
import { createDataTransfer } from '../datatransfer/DataTransfer';
import { getWindowFromElement } from '../dragndrop/DndEvents';
import { Chain } from './Chain';
import * as ChainSequence from './ChainSequence';
import { Step } from './Step';
import { cFindIn } from './UiFinder';

const pasteDataTransfer = (target: SugarElement<Element>, mutator: (dataTransfer: DataTransfer) => void): void => {
  const win = getWindowFromElement(target);
  const dataTransfer = createDataTransfer();
  const event = createPasteEvent(win, 0, 0, dataTransfer);

  mutator(dataTransfer);

  target.dom.dispatchEvent(event);
};

const pasteItems = (target: SugarElement<Element>, items: Record<string, string>): void =>
  pasteDataTransfer(target, (dataTransfer) => {
    Obj.each(items, (data, mime) => {
      dataTransfer.setData(mime, data);
    });
  });

const pasteFiles = (target: SugarElement<Element>, files: File[]): void =>
  pasteDataTransfer(target, (dataTransfer) => {
    Arr.each(files, (file) => {
      dataTransfer.items.add(file);
    });
  });

const cPasteDataTransfer = (mutator: (dataTransfer: DataTransfer) => void): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.op((target) => pasteDataTransfer(target, mutator));

const cPasteItems = (items: Record<string, string>): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.op((target) => pasteItems(target, items));

const cPasteFiles = (files: File[]): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.op((target) => pasteFiles(target, files));

const sPasteDataTransfer = <T>(mutator: (dataTransfer: DataTransfer) => void, selector: string): Step<T, T> =>
  Chain.isolate({}, ChainSequence.sequence([
    Chain.injectThunked(SugarBody.body),
    cFindIn(selector),
    cPasteDataTransfer(mutator)
  ]));

const sPasteItems = <T>(items: Record<string, string>, selector: string): Step<T, T> =>
  Chain.isolate({}, ChainSequence.sequence([
    Chain.injectThunked(SugarBody.body),
    cFindIn(selector),
    cPasteItems(items)
  ]));

const sPasteFiles = <T>(files: File[], selector: string): Step<T, T> =>
  Chain.isolate({}, ChainSequence.sequence([
    Chain.injectThunked(SugarBody.body),
    cFindIn(selector),
    cPasteFiles(files)
  ]));

const cut = (target: SugarElement<Element>): DataTransfer => {
  const win = getWindowFromElement(target);
  const dataTransfer = createDataTransfer();
  const event = createCutEvent(win, 0, 0, dataTransfer);

  target.dom.dispatchEvent(event);

  return dataTransfer;
};

const copy = (target: SugarElement<Element>): DataTransfer => {
  const win = getWindowFromElement(target);
  const dataTransfer = createDataTransfer();
  const event = createCopyEvent(win, 0, 0, dataTransfer);

  target.dom.dispatchEvent(event);

  return dataTransfer;
};

const cCut: Chain<SugarElement<any>, DataTransfer> =
  Chain.mapper(cut);

const cCopy: Chain<SugarElement<any>, DataTransfer> =
  Chain.mapper(copy);

export {
  pasteDataTransfer,
  pasteItems,
  pasteFiles,
  cPasteDataTransfer,
  cPasteItems,
  cPasteFiles,
  sPasteDataTransfer,
  sPasteItems,
  sPasteFiles,
  cut,
  copy,
  cCut,
  cCopy
};
