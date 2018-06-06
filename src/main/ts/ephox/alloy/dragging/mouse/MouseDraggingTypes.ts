import { Option } from '@ephox/katamari';
import { SugarElement, PositionCoordinates, SugarEvent } from 'ephox/alloy/alien/TypeDefinitions';
import { DraggingConfig, CommonDraggingConfigSpec } from 'ephox/alloy/dragging/common/DraggingTypes';

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