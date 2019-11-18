import { CommonDraggingConfigSpec, DraggingConfig } from '../common/DraggingTypes';

export interface MouseDraggingConfig extends DraggingConfig { }

export interface MouseDraggingConfigSpec extends CommonDraggingConfigSpec {
  mode: 'mouse';
}
