import { FieldSchema } from '@ephox/boulder';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as Fields from '../../data/Fields';

const builder = (detail) => {
  return {
    dom: detail.dom(),
    components: detail.components(),
    events: AlloyEvents.derive([
      AlloyEvents.stopper(SystemEvents.focusItem())
    ])
  };
};

const schema = [
  FieldSchema.strict('dom'),
  FieldSchema.strict('components'),
  Fields.output('builder', builder)
];

export default <any> schema;