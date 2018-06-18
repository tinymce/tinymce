import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { Receiving } from '../api/behaviour/Receiving';
import { Sandboxing } from '../api/behaviour/Sandboxing';
import * as Channels from '../api/messages/Channels';
import { NamedConfiguredBehaviour } from '../api/behaviour/Behaviour';
import { ReceivingConfig, ReceivingConfigSpec } from 'ephox/alloy/behaviour/receiving/ReceivingTypes';

const schema = ValueSchema.objOfOnly([
  FieldSchema.defaulted('isExtraPart', Fun.constant(false))
]);

const receivingConfig = (rawSpec): NamedConfiguredBehaviour<ReceivingConfigSpec, ReceivingConfig> => {
  const c = receiving(rawSpec);
  return Receiving.config(c);
};

const receiving = (rawSpec) => {
  const spec = ValueSchema.asRawOrDie('Dismissal', schema, rawSpec);
  return {
    channels: Objects.wrap(
      Channels.dismissPopups(),
      {
        schema: ValueSchema.objOfOnly([
          FieldSchema.strict('target')
        ]),
        onReceive (sandbox, data) {
          if (Sandboxing.isOpen(sandbox)) {
            const isPart = Sandboxing.isPartOf(sandbox, data.target()) || spec.isExtraPart(sandbox, data.target());
            if (! isPart) { Sandboxing.close(sandbox); }
          }
        }
      }
    )
  };
};

export {
  receiving,
  receivingConfig
};