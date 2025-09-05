import type { FieldProcessor } from '@ephox/boulder';
import type { EventArgs } from '@ephox/sugar';

import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { AlloyEventKeyAndHandler } from '../../api/events/AlloyEvents';
import * as Fields from '../../data/Fields';
import * as DraggingSchema from '../common/DraggingSchema';
import type { DraggingState } from '../common/DraggingTypes';
import * as DragUtils from '../common/DragUtils';
import * as MouseDragging from '../mouse/MouseDragging';
import * as TouchDragging from '../touch/TouchDragging';

import type { MouseOrTouchDraggingConfig } from './MouseOrTouchDraggingTypes';

const events = <E>(dragConfig: MouseOrTouchDraggingConfig<E>, dragState: DraggingState, updateStartState: (comp: AlloyComponent) => void) => [
  ...MouseDragging.events(dragConfig, dragState, updateStartState),
  ...TouchDragging.events(dragConfig, dragState, updateStartState)
] as AlloyEventKeyAndHandler<EventArgs<UIEvent>>[];

const schema: FieldProcessor[] = [
  ...DraggingSchema.schema,
  Fields.output('dragger', {
    handlers: DragUtils.handlers(events)
  })
];

export {
  schema
};
