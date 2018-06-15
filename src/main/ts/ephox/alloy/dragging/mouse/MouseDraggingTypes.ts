import { Option } from '@ephox/katamari';
import { SugarElement, SugarPosition, SugarEvent } from '../../alien/TypeDefinitions';
import { DraggingConfig, CommonDraggingConfigSpec } from '../../dragging/common/DraggingTypes';

export interface MouseDraggingConfig extends DraggingConfig {
  blockerClass: () => string;
}

export interface DragApi {
  drop: (AlloyComponent) => void;
  delayDrop: (AlloyComponent) => void;
  forceDrop: (AlloyComponent) => void;
  move: (SugarElement) => void;
}

export interface MouseDraggingConfigSpec extends CommonDraggingConfigSpec {
  mode: 'mouse';
  blockerClass: string;
}