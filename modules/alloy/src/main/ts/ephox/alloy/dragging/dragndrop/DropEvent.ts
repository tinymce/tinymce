import { EventArgs } from '@ephox/sugar';

import { SimulatedEvent } from '../../events/SimulatedEvent';
import * as DataTransfers from './DataTransfers';
import { DroppingConfig } from './DragnDropTypes';

export interface DropEvent extends SimulatedEvent<EventArgs<DragEvent>> {
  data: string;
  files: File[];
}

export const createDropEventDetails = (config: DroppingConfig, event: SimulatedEvent<EventArgs<DragEvent>>): DropEvent => {
  const rawEvent = event.event.raw;
  // TODO: Should this handle if dataTransfer is null?
  const transfer = rawEvent.dataTransfer as DataTransfer;
  const data = DataTransfers.getData(transfer, config.type);
  const files = DataTransfers.getFiles(transfer);

  return {
    ...event,
    data,
    files
  };
};
