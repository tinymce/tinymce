import type { CommonDraggingConfigSpec, DraggingConfig } from '../common/DraggingTypes';

export interface TouchDraggingConfigSpec<E> extends CommonDraggingConfigSpec<E> {
  mode: 'touch';
  readonly blockerClass: string;
}

export interface TouchDraggingConfig<E> extends DraggingConfig<E> { }
