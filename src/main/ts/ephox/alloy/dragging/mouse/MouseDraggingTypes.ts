import { DraggingConfig, CommonDraggingConfigSpec } from '../../dragging/common/DraggingTypes';

export interface MouseDraggingConfig extends DraggingConfig {
  blockerClass: () => string;
}

export interface DragApi {
  drop: (AlloyComponent) => void;
  delayDrop: (AlloyComponent) => void;
  forceDrop: (AlloyComponent) => void;
  move: (Element) => void;
}

export interface MouseDraggingConfigSpec extends CommonDraggingConfigSpec {
  mode: 'mouse';
  blockerClass: string;
}