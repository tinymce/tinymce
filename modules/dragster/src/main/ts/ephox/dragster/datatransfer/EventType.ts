import { Id, Optional } from '@ephox/katamari';

export const enum DtEvent {
  Dragstart,
  Dragend,
  Drop
}

const eventId = Id.generate('event');

const getEventType = (transfer: DataTransfer): Optional<DtEvent> => {
  const dt: any = transfer;
  return Optional.from(dt[eventId]);
};

const setEventType = (transfer: DataTransfer, type: DtEvent): void => {
  const dt: any = transfer;
  dt[eventId] = type;
};

const checkEvent = (expectedType: DtEvent) => (transfer: DataTransfer): boolean => {
  const dt: any = transfer;
  return Optional.from(dt[eventId]).exists((type) => type === expectedType);
};

const isInDragStartEvent = checkEvent(DtEvent.Dragstart);
const isInDropEvent = checkEvent(DtEvent.Drop);
const isInDragEndEvent = checkEvent(DtEvent.Dragend);

export {
  getEventType,
  setEventType,
  isInDragStartEvent,
  isInDropEvent,
  isInDragEndEvent
};
