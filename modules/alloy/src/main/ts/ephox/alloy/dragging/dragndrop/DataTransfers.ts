import { Arr, Strings, Type } from '@ephox/katamari';

import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

const setData = (transfer: DataTransfer, types: string[], data: string): void => {
  transfer.items.clear();
  Arr.each(types, (type) => {
    transfer.items.add(data, type);
  });
};

const getData = (transfer: DataTransfer, type: string): string => {
  const data = transfer.getData(type);

  // IE 11 will return null on drag/drop of files
  return Type.isNull(data) ? '' : data;
};

const setDragImage = (transfer: DataTransfer, image: Element, x: number, y: number): void => {
  transfer.setDragImage(image, x, y);
};

const setDropEffect = (transfer: DataTransfer, effect: DataTransfer['dropEffect']): void => {
  transfer.dropEffect = effect;
};

const setEffectAllowed = (transfer: DataTransfer, effect: DataTransfer['effectAllowed']): void => {
  transfer.effectAllowed = effect;
};

const getFiles = (transfer: DataTransfer): File[] => Arr.from(transfer.files);

// IE 11 and Edge doesn't seem to support effectAllow properly the drop event fires even if it shouldn't, so we need to manually check as well
const isValidDrop = (transfer: DataTransfer): boolean => {
  const effectAllowed = transfer.effectAllowed.toLowerCase();
  const dropEffect = transfer.dropEffect.toLowerCase();

  return effectAllowed === 'all' || effectAllowed === 'uninitialized' || Strings.contains(effectAllowed, dropEffect);
};

const getDataTransferFromEvent = (simulatedEvent: NativeSimulatedEvent<DragEvent>): DataTransfer => {
  const rawEvent = simulatedEvent.event.raw;
  // TODO: Should this handle if dataTransfer is null?
  return rawEvent.dataTransfer as DataTransfer;
};

const setDropEffectOnEvent = (simulatedEvent: NativeSimulatedEvent<DragEvent>, dropEffect: DataTransfer['dropEffect']): void => {
  setDropEffect(getDataTransferFromEvent(simulatedEvent), dropEffect);
};

export {
  setData,
  getData,
  setDragImage,
  setDropEffect,
  setEffectAllowed,
  getFiles,
  isValidDrop,
  getDataTransferFromEvent,
  setDropEffectOnEvent
};
