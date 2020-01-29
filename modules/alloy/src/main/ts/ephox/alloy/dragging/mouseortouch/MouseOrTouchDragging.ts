import { FieldProcessorAdt } from '@ephox/boulder';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as DraggingSchema from '../common/DraggingSchema';
import { DraggingState } from '../common/DraggingTypes';
import * as DragUtils from '../common/DragUtils';
import * as MouseDragging from '../mouse/MouseDragging';
import * as TouchDragging from '../touch/TouchDragging';
import { MouseOrTouchDraggingConfig } from './MouseOrTouchDraggingTypes';

const events = (dragConfig: MouseOrTouchDraggingConfig, dragState: DraggingState, updateStartState: (comp: AlloyComponent) => void) => {
  return [
    ...MouseDragging.events(dragConfig, dragState, updateStartState),
    ...TouchDragging.events(dragConfig, dragState, updateStartState),
  ];
};

const schema: FieldProcessorAdt[] = [
  ...DraggingSchema.schema,
  Fields.output('dragger', {
    handlers: DragUtils.handlers(events)
  })
];

export {
  schema
};
