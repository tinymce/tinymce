import { CommonDraggingConfigSpec, DraggingConfig } from '../common/DraggingTypes';

export interface TouchDraggingConfigSpec extends CommonDraggingConfigSpec {
  mode: 'touch';
}

export interface TouchDraggingConfig extends DraggingConfig { }
