import { CommonDraggingConfigSpec, DraggingConfig } from '../common/DraggingTypes';

export interface MouseOrTouchDraggingConfigSpec extends CommonDraggingConfigSpec {
  mode: 'mouseOrTouch';
}

export interface MouseOrTouchDraggingConfig extends DraggingConfig { }
