import { DraggingConfig, CommonDraggingConfigSpec } from '../../dragging/common/DraggingTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Element } from '@ephox/sugar';
import { SugarEvent } from '../../alien/TypeDefinitions';

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