import type { CommonDraggingConfigSpec, DraggingConfig } from '../common/DraggingTypes';

export interface PointerDraggingConfig<E> extends DraggingConfig<E> { }

export interface PointerDraggingConfigSpec<E> extends CommonDraggingConfigSpec<E> {
  mode: 'pointer';
}
