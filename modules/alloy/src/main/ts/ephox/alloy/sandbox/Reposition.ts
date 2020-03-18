import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import { NamedConfiguredBehaviour } from '../api/behaviour/Behaviour';
import { Receiving } from '../api/behaviour/Receiving';
import { Sandboxing } from '../api/behaviour/Sandboxing';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';
import * as Channels from '../api/messages/Channels';
import { ReceivingConfig, ReceivingConfigSpec } from '../behaviour/receiving/ReceivingTypes';

export interface RepositionReceivingDetail {
  doReposition: (sandbox: AlloyComponent) => void;
  fireEventInstead: Option<{
    event: string;
  }>;
}

export interface RepositionReceivingSpec {
  doReposition: (sandbox: AlloyComponent) => void;
  fireEventInstead?: {
    event?: string;
  };
}

const schema = ValueSchema.objOfOnly([
  FieldSchema.optionObjOf('fireEventInstead', [
    FieldSchema.defaulted('event', SystemEvents.repositionRequested())
  ]),
  FieldSchema.strictFunction('doReposition')
]);

const receivingConfig = (rawSpec: RepositionReceivingSpec): NamedConfiguredBehaviour<ReceivingConfigSpec, ReceivingConfig> => {
  const c = receivingChannel(rawSpec);
  return Receiving.config({
    channels: c
  });
};

const receivingChannel = (rawSpec: RepositionReceivingSpec) => {
  const detail: RepositionReceivingDetail = ValueSchema.asRawOrDie('Reposition', schema, rawSpec);
  return {
    [ Channels.repositionPopups() ]: {
      onReceive(sandbox: AlloyComponent) {
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
