import { Id, Optional } from '@ephox/katamari';

export const enum Event {
  Dragstart,
  Dragend,
  Drop
}

const eventId = Id.generate('event');

const getEvent = (transfer: DataTransfer): Optional<Event> => {
  const dt: Record<string, any> = transfer;
  return Optional.from(dt[eventId]);
};

const mkSetEventFn = (type: Event) => (transfer: DataTransfer): void => {
  const dt: Record<string, any> = transfer;
  dt[eventId] = type;
};

const setEvent = (transfer: DataTransfer, type: Event): void => mkSetEventFn(type)(transfer);

const setDragstartEvent = mkSetEventFn(Event.Dragstart);
const setDropEvent = mkSetEventFn(Event.Drop);
const setDragendEvent = mkSetEventFn(Event.Dragend);

const checkEvent = (expectedType: Event) => (transfer: DataTransfer): boolean => {
  const dt: Record<string, any> = transfer;
  return Optional.from(dt[eventId]).exists((type) => type === expectedType);
};

const isInDragStartEvent = checkEvent(Event.Dragstart);
const isInDropEvent = checkEvent(Event.Drop);
const isInDragEndEvent = checkEvent(Event.Dragend);

export {
  getEvent,
  setEvent,
  setDragstartEvent,
  setDropEvent,
  setDragendEvent,
  isInDragStartEvent,
  isInDropEvent,
  isInDragEndEvent
};
