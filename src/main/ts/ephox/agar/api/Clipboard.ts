import { File, DataTransfer } from "@ephox/dom-globals";
import { Chain } from "./Main";
import { cFindIn } from "./UiFinder";
import { Body, Element } from "@ephox/sugar";
import { getWindowFromElement } from "../dragndrop/DndEvents";
import { createDataTransfer } from "../datatransfer/DataTransfer";
import { Arr, Obj } from "@ephox/katamari";
import { createPasteEvent, createCopyEvent, createCutEvent } from "../clipboard/ClipboardEvents";

const cPasteDataTransfer = (mutator: (dataTransfer: DataTransfer) => void) => Chain.op<Element>((target) => {
  const win = getWindowFromElement(target);
  const dataTransfer = createDataTransfer();
  const event = createPasteEvent(win, 0, 0, dataTransfer);

  mutator(dataTransfer);

  target.dom().dispatchEvent(event);
});

const cPasteItems = (items: Record<string, string>) => {
  return cPasteDataTransfer((dataTransfer) => {
    Obj.each(items, (data, mime) => {
      dataTransfer.setData(mime, data);
    });
  });
};

const cPasteFiles = (files: File[]) => {
  return cPasteDataTransfer((dataTransfer) => {
    Arr.each(files, (file) => {
      dataTransfer.items.add(file);
    });
  });
};

const sPasteDataTransfer = (mutator: (dataTransfer: DataTransfer) => void, selector: string) => Chain.asStep({}, [
  Chain.injectThunked(Body.body),
  cFindIn(selector),
  cPasteDataTransfer(mutator)
]);

const sPasteItems = (items: Record<string, string>, selector: string) => Chain.asStep({}, [
  Chain.injectThunked(Body.body),
  cFindIn(selector),
  cPasteItems(items)
]);

const sPasteFiles = (files: File[], selector: string) => Chain.asStep({}, [
  Chain.injectThunked(Body.body),
  cFindIn(selector),
  cPasteFiles(files)
]);

const cCut = Chain.mapper<Element, DataTransfer>((target) => {
  const win = getWindowFromElement(target);
  const dataTransfer = createDataTransfer();
  const event = createCutEvent(win, 0, 0, dataTransfer);

  target.dom().dispatchEvent(event);

  return dataTransfer;
});

const cCopy = Chain.mapper<Element, DataTransfer>((target) => {
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
