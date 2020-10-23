import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { NamedConfiguredBehaviour } from '../api/behaviour/Behaviour';
import { Receiving } from '../api/behaviour/Receiving';
import { Sandboxing } from '../api/behaviour/Sandboxing';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';
import * as Channels from '../api/messages/Channels';
import { ReceivingConfig, ReceivingConfigSpec } from '../behaviour/receiving/ReceivingTypes';

interface DismissalReceivingDetail {
  isExtraPart: (sandbox: AlloyComponent, target: SugarElement) => boolean;
  fireEventInstead: Optional<{
    event: string;
  }>;
}

export interface DismissalReceivingSpec {
  isExtraPart?: (sandbox: AlloyComponent, target: SugarElement) => boolean;
  fireEventInstead?: {
    event?: string;
  };
}

const schema = ValueSchema.objOfOnly([
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

const receivingChannel = (rawSpec: DismissalReceivingSpec) => {
  const detail: DismissalReceivingDetail = ValueSchema.asRawOrDie('Dismissal', schema, rawSpec);
  return {
    [Channels.dismissPopups()]: {
      schema: ValueSchema.objOfOnly([
        FieldSchema.strict('target')
      ]),
      onReceive(sandbox: AlloyComponent, data: { target: SugarElement }) {
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
