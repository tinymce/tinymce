import { FieldProcessorAdt } from '@ephox/boulder';
import { UIEvent } from '@ephox/dom-globals';
import { EventArgs } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloyEventKeyAndHandler } from '../../api/events/AlloyEvents';
import * as Fields from '../../data/Fields';
import * as DraggingSchema from '../common/DraggingSchema';
import { DraggingState } from '../common/DraggingTypes';
import * as DragUtils from '../common/DragUtils';
import * as MouseDragging from '../mouse/MouseDragging';
import * as TouchDragging from '../touch/TouchDragging';
import { MouseOrTouchDraggingConfig } from './MouseOrTouchDraggingTypes';

const events = <E>(dragConfig: MouseOrTouchDraggingConfig<E>, dragState: DraggingState, updateStartState: (comp: AlloyComponent) => void) => [
  ...MouseDragging.events(dragConfig, dragState, updateStartState),
  ...TouchDragging.events(dragConfig, dragState, updateStartState)
] as AlloyEventKeyAndHandler<EventArgs<UIEvent>>[];

const schema: FieldProcessorAdt[] = [
  ...DraggingSchema.schema,
  Fields.output('dragger', {
    handlers: DragUtils.handlers(events)
  })
];

export {
  schema
};
