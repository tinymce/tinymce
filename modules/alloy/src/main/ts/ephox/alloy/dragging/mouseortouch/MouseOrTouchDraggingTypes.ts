import { CommonDraggingConfigSpec, DraggingConfig } from '../common/DraggingTypes';

export interface MouseOrTouchDraggingConfigSpec<E> extends CommonDraggingConfigSpec<E> {
  mode: 'mouseOrTouch';
}

export interface MouseOrTouchDraggingConfig<E> extends DraggingConfig<E> { }
