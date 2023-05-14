import { Id, Optional } from '@ephox/katamari';
import { DragEventType } from '../core/DragEvent';

const eventId = Id.generate('event');

const getEventType = (transfer: DataTransfer): Optional<DragEventType> => {
  const dt: any = transfer;
  return Optional.from(dt[eventId]);
};

const setEventType = (transfer: DataTransfer, type: DragEventType): void => {
  const dt: any = transfer;
  dt[eventId] = type;
};

const checkEvent = (expectedType: DragEventType) => (transfer: DataTransfer): boolean => {
  const dt: any = transfer;
  return Optional.from(dt[eventId]).exists((type) => type === expectedType);
};

const isInDragStartEvent = checkEvent('dragstart');
const isInDropEvent = checkEvent('drop');
const isInDragEndEvent = checkEvent('dragend');

export {
  getEventType,
  setEventType,
  isInDragStartEvent,
  isInDropEvent,
  isInDragEndEvent
};
