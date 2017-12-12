import AlloyEvents from '../../api/events/AlloyEvents';
import SystemEvents from '../../api/events/SystemEvents';
import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';

var builder = function (detail) {
  return {
    dom: detail.dom(),
    components: detail.components(),
    events: AlloyEvents.derive([
      AlloyEvents.stopper(SystemEvents.focusItem())
    ])
  };
};

var schema = [
  FieldSchema.strict('dom'),
  FieldSchema.strict('components'),
  Fields.output('builder', builder)
];

export default <any> schema;