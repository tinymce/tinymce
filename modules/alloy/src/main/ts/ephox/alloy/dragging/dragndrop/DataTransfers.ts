import { DataTransfer, Element } from '@ephox/dom-globals';
import { Arr, Type, Strings } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

const platform = PlatformDetection.detect();

// IE 11 only supports 'Text' or 'URL' types see: https://msdn.microsoft.com/en-us/ie/ms536744(v=vs.94)
const getPlatformType = (type: string) => platform.browser.isIE() ? 'text' : type;

const setDataTransferFallback = (transfer: DataTransfer, types: string[], data: string) => {
  Arr.each(types, (type) => {
    const platformType = getPlatformType(type);

    try {
      transfer.setData(platformType, data);
    } catch (_) {
      // Edge doesn't allow custom mime types
    }
  });
};

const setDataItems = (transfer: DataTransfer, types: string[], data: string) => {
  transfer.items.clear();
  Arr.each(types, (type) => {
    transfer.items.add(data, type);
  });
};

const setData = (transfer: DataTransfer, types: string[], data: string) => {
  // IE only supports the transfer.setData api with 'text'
  // Edge throws exceptions when setting custom mime types
  // Firefox (ESR 60) and older will corrupt all drag/drop handling if you use the items api
  const oldFirefox = platform.browser.isFirefox() && platform.browser.version.major < 66;
  if (platform.browser.isIE() || platform.browser.isEdge() || oldFirefox) {
    setDataTransferFallback(transfer, types, data);
  } else {
    setDataItems(transfer, types, data);
  }
};

const getData = (transfer: DataTransfer, type: string) => {
  const data = transfer.getData(getPlatformType(type));

  // IE 11 will return null on drag/drop of files
  return Type.isNull(data) ? '' : data;
};

const hasDragImageSupport = (transfer: DataTransfer) => !Type.isUndefined(transfer.setDragImage);

const setDragImage = (transfer: DataTransfer, image: Element, x: number, y: number) => {
  // IE 11 and Edge doesn't have support for setting drag image we can't really
  // fake it either since it shows the element being dragged instead
  if (hasDragImageSupport(transfer)) {
    transfer.setDragImage(image, x, y);
  }
};

const setDropEffect = (transfer: DataTransfer, effect: string) => {
  transfer.dropEffect = effect;
};

const setEffectAllowed = (transfer: DataTransfer, effect: string) => {
  transfer.effectAllowed = effect;
};

const getFiles = (transfer: DataTransfer) => {
  return Arr.from(transfer.files);
};

// IE 11 and Edge doesn't seem to support effectAllow properly the drop event fires even if it shouldn't, so we need to manually check as well
const isValidDrop = (transfer: DataTransfer) => {
  const effectAllowed = transfer.effectAllowed.toLowerCase();
  const dropEffect = transfer.dropEffect.toLowerCase();

  return effectAllowed === 'all' || effectAllowed === 'uninitialized' || Strings.contains(effectAllowed, dropEffect);
};

const getDataTransferFromEvent = (simulatedEvent: NativeSimulatedEvent): DataTransfer => {
  const rawEvent: any = simulatedEvent.event().raw();
  return rawEvent.dataTransfer;
};

const setDropEffectOnEvent = (simulatedEvent: NativeSimulatedEvent, dropEffect: string) => {
  setDropEffect(getDataTransferFromEvent(simulatedEvent), dropEffect);
};

export {
  setData,
  getData,
  hasDragImageSupport,
  setDragImage,
  setDropEffect,
  setEffectAllowed,
  getFiles,
  isValidDrop,
  getDataTransferFromEvent,
  setDropEffectOnEvent
};
