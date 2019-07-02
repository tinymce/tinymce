import { SugarEvent } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { DraggingConfig, CommonDraggingConfigSpec } from '../common/DraggingTypes';

export interface MouseDraggingConfig extends DraggingConfig {
  blockerClass: string;
}

export interface DragApi {
  drop: (comp: AlloyComponent) => void;
  delayDrop: (comp: AlloyComponent) => void;
  forceDrop: (comp: AlloyComponent) => void;
  move: (evt: SugarEvent) => void;
}

export interface MouseDraggingConfigSpec extends CommonDraggingConfigSpec {
  mode: 'mouse';
  blockerClass: string;
}
