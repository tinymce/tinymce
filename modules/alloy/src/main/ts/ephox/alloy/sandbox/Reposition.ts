import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import { NamedConfiguredBehaviour } from '../api/behaviour/Behaviour';
import { Receiving } from '../api/behaviour/Receiving';
import { Sandboxing } from '../api/behaviour/Sandboxing';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';
import * as Channels from '../api/messages/Channels';
import { ReceivingChannelSpec, ReceivingConfig, ReceivingConfigSpec } from '../behaviour/receiving/ReceivingTypes';

export interface RepositionReceivingDetail {
  doReposition: (sandbox: AlloyComponent) => void;
  fireEventInstead: Optional<{
    event: string;
  }>;
}

export interface RepositionReceivingSpec {
  doReposition: (sandbox: AlloyComponent) => void;
  fireEventInstead?: {
    event?: string;
  };
}

const schema = StructureSchema.objOfOnly([
  FieldSchema.optionObjOf('fireEventInstead', [
    FieldSchema.defaulted('event', SystemEvents.repositionRequested())
  ]),
  FieldSchema.requiredFunction('doReposition')
]);

const receivingConfig = (rawSpec: RepositionReceivingSpec): NamedConfiguredBehaviour<ReceivingConfigSpec, ReceivingConfig> => {
  const c = receivingChannel(rawSpec);
  return Receiving.config({
    channels: c
  });
};

const receivingChannel = (rawSpec: RepositionReceivingSpec): Record<string, ReceivingChannelSpec> => {
  const detail: RepositionReceivingDetail = StructureSchema.asRawOrDie('Reposition', schema, rawSpec);
  return {
    [Channels.repositionPopups()]: {
      onReceive: (sandbox: AlloyComponent) => {
        if (Sandboxing.isOpen(sandbox)) {
          detail.fireEventInstead.fold(
            () => detail.doReposition(sandbox),
            (fe) => AlloyTriggers.emit(sandbox, fe.event)
          );
        }
      }
    }
  };
};

export {
  receivingChannel,
  receivingConfig
};
