import type { CommonDraggingConfigSpec, DraggingConfig } from '../common/DraggingTypes';

export interface MouseOrTouchDraggingConfigSpec<E> extends CommonDraggingConfigSpec<E> {
  mode: 'mouseOrTouch';
  readonly blockerClass: string;
}

export interface MouseOrTouchDraggingConfig<E> extends DraggingConfig<E> { }
