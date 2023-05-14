import { cloneDataTransfer } from './DataTransfer';
import { DragEventType, setEventType } from './DragEventType';
import { Mode, setMode } from './Mode';

const makeDataTransferCopyForDragEvent = (dataTransfer: DataTransfer, eventType: DragEventType, mode: Mode) => {
  const copy = cloneDataTransfer(dataTransfer);
  setEventType(copy, eventType);
  setMode(copy, mode);
  return copy;
};

const makeDataTransferCopyForDragstart = (dataTransfer: DataTransfer): DataTransfer =>
  makeDataTransferCopyForDragEvent(dataTransfer, DragEventType.dragstart, Mode.ReadWrite);

const makeDataTransferCopyForDrop = (dataTransfer: DataTransfer): DataTransfer =>
  makeDataTransferCopyForDragEvent(dataTransfer, DragEventType.drop, Mode.ReadOnly);

const makeDataTransferCopyForDragEnd = (dataTransfer: DataTransfer): DataTransfer =>
  makeDataTransferCopyForDragEvent(dataTransfer, DragEventType.dragend, Mode.ReadOnly);

export {
  makeDataTransferCopyForDragstart,
  makeDataTransferCopyForDrop,
  makeDataTransferCopyForDragEnd
};
