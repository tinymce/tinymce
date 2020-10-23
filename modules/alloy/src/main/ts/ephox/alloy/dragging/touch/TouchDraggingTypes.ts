import { CommonDraggingConfigSpec, DraggingConfig } from '../common/DraggingTypes';

export interface TouchDraggingConfigSpec<E> extends CommonDraggingConfigSpec<E> {
  mode: 'touch';
}

export interface TouchDraggingConfig<E> extends DraggingConfig<E> { }
