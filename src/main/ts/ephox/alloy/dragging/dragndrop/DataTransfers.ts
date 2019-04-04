import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { DataTransfer, Element } from '@ephox/dom-globals';

const platform = PlatformDetection.detect();

const setDataTransfer = (transfer: DataTransfer, types: string[], data: string) => {
  Arr.each(types, (rawType) => {
    const type = platform.browser.isIE() && rawType.indexOf('text') === 0 ? 'text' : rawType;
    transfer.setData(type, data);
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

const getData = (transfer: DataTransfer, rawType: string) => {
  const type = platform.browser.isIE() && rawType.indexOf('text') === 0 ? 'text' : rawType;
  return transfer.getData(type);
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