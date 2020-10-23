import { CommonDraggingConfigSpec, DraggingConfig } from '../common/DraggingTypes';

export interface MouseDraggingConfig<E> extends DraggingConfig<E> { }

export interface MouseDraggingConfigSpec<E> extends CommonDraggingConfigSpec<E> {
  mode: 'mouse';
}
