import { Arr, Type } from '@ephox/katamari';
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
  const data = transfer.getData(getPlatformType(type));

  // IE 11 will return null on drag/drop of files
  return Type.isNull(data) ? '' : data;
};

const setDragImage = (transfer: DataTransfer, image: Element, x: number, y: number) => {
  // IE 11 and Edge doesn't have support for setting drag image we can't really
  // fake it either since it shows the element being dragged instead
  if (transfer.setDragImage) {
    transfer.setDragImage(image, x, y);
  }
};

const setDropEffect = (transfer: DataTransfer, effect: string) => {
  transfer.dropEffect = effect;
};

const getFiles = (transfer: DataTransfer) => {
  return Arr.from(transfer.files);
};

export {
  setData,
  getData,
  setDragImage,
  setDropEffect,
  getFiles
};