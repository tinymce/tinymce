import { CommonDraggingConfigSpec, DraggingConfig } from '../../dragging/common/DraggingTypes';

export interface TouchDraggingConfigSpec extends CommonDraggingConfigSpec {
  mode: 'touch';
}

export interface TouchDraggingConfig extends DraggingConfig { }