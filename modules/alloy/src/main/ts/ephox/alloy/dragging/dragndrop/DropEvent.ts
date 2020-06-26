import { DragEvent, File } from '@ephox/dom-globals';
import { EventArgs } from '@ephox/sugar';

import { SimulatedEvent } from '../../events/SimulatedEvent';
import * as DataTransfers from './DataTransfers';
import { DroppingConfig } from './DragnDropTypes';

export interface DropEvent extends SimulatedEvent<EventArgs<DragEvent>> {
  readonly data: string;
  readonly files: File[];
}

export const createDropEventDetails = (config: DroppingConfig, event: SimulatedEvent<EventArgs<DragEvent>>): DropEvent => {
  const rawEvent = event.event().raw();
  const transfer = rawEvent.dataTransfer;
  const data = transfer === null ? '' : DataTransfers.getData(transfer, config.type);
  const files = transfer === null ? [] : DataTransfers.getFiles(transfer);

  return {
    ...event,
    data,
    files
  };
};
