import { DragEventType } from '../core/DragEvent';
import { cloneDataTransfer } from './DataTransfer';
import { setEventType } from './DragEventType';
import { Mode, setMode } from './Mode';

const makeDataTransferCopyForDragEvent = (dataTransfer: DataTransfer, eventType: DragEventType): DataTransfer => {
  const copy = cloneDataTransfer(dataTransfer);
  setEventType(copy, eventType);
  // TINY-9601: Set mode as per https://html.spec.whatwg.org/dev/dnd.html#concept-dnd-rw
  if (eventType === 'dragstart') {
    setMode(copy, Mode.ReadWrite);
  } else if (eventType === 'drop') {
    setMode(copy, Mode.ReadOnly);
  } else {
    setMode(copy, Mode.Protected);
  }
  return copy;
};

export { makeDataTransferCopyForDragEvent };
