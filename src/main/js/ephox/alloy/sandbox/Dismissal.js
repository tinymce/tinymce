import Receiving from '../api/behaviour/Receiving';
import Sandboxing from '../api/behaviour/Sandboxing';
import Channels from '../api/messages/Channels';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var schema = ValueSchema.objOfOnly([
  FieldSchema.defaulted('isExtraPart', Fun.constant(false))
]);

var receivingConfig = function (rawSpec) {
  var c = receiving(rawSpec);
  return Receiving.config(c);
};

var receiving = function (rawSpec) {
  var spec = ValueSchema.asRawOrDie('Dismissal', schema, rawSpec);
  return {
    channels: Objects.wrap(
      Channels.dismissPopups(),
      {
        schema: ValueSchema.objOfOnly([
          FieldSchema.strict('target')
        ]),
        onReceive: function (sandbox, data) {
          if (Sandboxing.isOpen(sandbox)) {
            var isPart = Sandboxing.isPartOf(sandbox, data.target()) || spec.isExtraPart(sandbox, data.target());
            if (! isPart) Sandboxing.close(sandbox);
          }
        }
      }
    )
  };
};

export default <any> {
  receiving: receiving,
  receivingConfig: receivingConfig
};