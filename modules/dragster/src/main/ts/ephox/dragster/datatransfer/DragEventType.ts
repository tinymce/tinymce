import { Id, Optional } from '@ephox/katamari';

const eventId = Id.generate('event');

export const enum DragEventType {
  dragstart,
  drop,
  dragend
}

const getEventType = (transfer: DataTransfer): Optional<DragEventType> => {
  const dt: any = transfer;
  return Optional.from(dt[eventId]);
};

const setEventType = (transfer: DataTransfer, event: DragEventType): void => {
  const dt: any = transfer;
  dt[eventId] = event;
};

const checkEvent = (expectedType: DragEventType) => (transfer: DataTransfer): boolean => {
  const dt: any = transfer;
  return Optional.from(dt[eventId]).exists((type) => type === expectedType);
};

const isInDragStartEvent = checkEvent(DragEventType.dragstart);
const isInDropEvent = checkEvent(DragEventType.drop);
const isInDragEndEvent = checkEvent(DragEventType.dragend);

export {
  getEventType,
  setEventType,
  isInDragStartEvent,
  isInDropEvent,
  isInDragEndEvent
};
