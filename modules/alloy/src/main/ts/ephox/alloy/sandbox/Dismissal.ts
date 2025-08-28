import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { NamedConfiguredBehaviour } from '../api/behaviour/Behaviour';
import { Receiving } from '../api/behaviour/Receiving';
import { Sandboxing } from '../api/behaviour/Sandboxing';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';
import * as Channels from '../api/messages/Channels';
import { ReceivingChannelSpec, ReceivingConfig, ReceivingConfigSpec } from '../behaviour/receiving/ReceivingTypes';

interface DismissalReceivingDetail {
  isExtraPart: (sandbox: AlloyComponent, target: SugarElement<Node>) => boolean;
  fireEventInstead: Optional<{
    event: string;
  }>;
}

export interface DismissalReceivingSpec {
  isExtraPart?: (sandbox: AlloyComponent, target: SugarElement<Node>) => boolean;
  fireEventInstead?: {
    event?: string;
  };
}

const schema = StructureSchema.objOfOnly([
  FieldSchema.defaulted('isExtraPart', Fun.never),
  FieldSchema.optionObjOf('fireEventInstead', [
    FieldSchema.defaulted('event', SystemEvents.dismissRequested())
  ])
]);

const receivingConfig = (rawSpec: DismissalReceivingSpec): NamedConfiguredBehaviour<ReceivingConfigSpec, ReceivingConfig> => {
  const c = receivingChannel(rawSpec);
  return Receiving.config({
    channels: c
  });
};

const receivingChannel = (rawSpec: DismissalReceivingSpec): Record<string, ReceivingChannelSpec> => {
  const detail: DismissalReceivingDetail = StructureSchema.asRawOrDie('Dismissal', schema, rawSpec);
  return {
    [Channels.dismissPopups()]: {
      schema: StructureSchema.objOfOnly([
        FieldSchema.required('target')
      ]),
      onReceive: (sandbox: AlloyComponent, data: { target: SugarElement<Node> }) => {
        if (Sandboxing.isOpen(sandbox)) {
          const isPart = Sandboxing.isPartOf(sandbox, data.target) || detail.isExtraPart(sandbox, data.target);
          if (!isPart) {
            detail.fireEventInstead.fold(
              () => Sandboxing.close(sandbox),
              (fe) => AlloyTriggers.emit(sandbox, fe.event)
            );
          }
        }
      }
    }
  };
};

export {
  receivingChannel,
  receivingConfig
};
