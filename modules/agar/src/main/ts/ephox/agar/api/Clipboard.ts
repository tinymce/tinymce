import { Arr, Obj } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';

import { createCopyEvent, createCutEvent, createPasteEvent } from '../clipboard/ClipboardEvents';
import { createDataTransfer } from '../datatransfer/DataTransfer';
import { getWindowFromElement } from '../dragndrop/DndEvents';
import * as BlobReader from '../file/BlobReader';
import { Chain } from './Chain';
import * as ChainSequence from './ChainSequence';
import { Step } from './Step';
import { cFindIn } from './UiFinder';

export interface PasteUrlItem {
  readonly kind: 'string' | 'file';
  readonly url: string;
}

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

const cPasteDataTransfer = <T extends Element>(mutator: (dataTransfer: DataTransfer) => void): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op((target) => pasteDataTransfer(target, mutator));

const cPasteItems = <T extends Element>(items: Record<string, string>): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op((target) => pasteItems(target, items));

const cPasteFiles = <T extends Element>(files: File[]): Chain<SugarElement<T>, SugarElement<T>> =>
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

const pPasteUrlItems = async (target: SugarElement<Element>, items: PasteUrlItem[]): Promise<void> => {
  const dataItems = await Promise.all(Arr.map(items, async (item) => {
    const resp = await window.fetch(item.url);

    if (resp.ok) {
      const blob = await resp.blob();
      const fileName = Arr.last(item.url.split('/')).getOr('filename.dat');
      const mime = blob.type.split(';')[0]; // Only grab mime type not charset encoding

      if (item.kind === 'string') {
        return { kind: 'string', mime, text: await BlobReader.readBlobAsString(blob) };
      } else {
        return { kind: item.kind, file: new window.File([ blob ], fileName, { type: mime }) };
      }
    } else {
      return Promise.reject(new Error(`Failed to load paste URL item: "${item.url}", status: ${resp.status}`));
    }
  }));

  pasteDataTransfer(target, (dataTransfer) => {
    Arr.each(dataItems, (dataItem) => {
      if (dataItem.kind === 'string') {
        dataTransfer.items.add(dataItem.text, dataItem.mime);
      } else {
        dataTransfer.items.add(dataItem.file);
      }
    });
  });
};

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

const cCut: Chain<SugarElement<Element>, DataTransfer> =
  Chain.mapper(cut);

const cCopy: Chain<SugarElement<Element>, DataTransfer> =
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
  pPasteUrlItems,
  cut,
  copy,
  cCut,
  cCopy
};
