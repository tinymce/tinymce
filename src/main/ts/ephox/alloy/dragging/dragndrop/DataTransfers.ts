import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { DataTransfer, Element } from '@ephox/dom-globals';

const platform = PlatformDetection.detect();

// IE 11 only supports 'Text' or 'URL' types see: https://msdn.microsoft.com/en-us/ie/ms536744(v=vs.94)
const getPlatformType = (type: string) => platform.browser.isIE() ? 'text' : type;

const setDataTransfer = (transfer: DataTransfer, types: string[], data: string) => {
  Arr.each(types, (type) => {
    transfer.setData(getPlatformType(type), data);
  });
};

const setDataItems = (transfer: DataTransfer, types: string[], data: string) => {
  transfer.items.clear();
  Arr.each(types, (type) => {
    transfer.items.add(data, type);
  });
};

const setData = (transfer: DataTransfer, types: string[], data: string) => {
  // If we use setDataItems on Firefox and Linux, it basically gets into a failed state
  // which corrupts all drag and drops on that Firefox process. Avoid.
  const set = platform.browser.isChrome() ? setDataItems : setDataTransfer;
  set(transfer, types, data);
};

const getData = (transfer: DataTransfer, type: string) => {
  return transfer.getData(getPlatformType(type));
};

const setDragImage = (transfer: DataTransfer, image: Element, x: number, y: number) => {
  if (transfer.setDragImage) {
    transfer.setDragImage(image, x, y);
  }
};

const setDropEffect = (transfer: DataTransfer, effect: string) => {
  transfer.dropEffect = effect;
};

export {
  setData,
  getData,
  setDragImage,
  setDropEffect
};