import { SugarEvent } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface BlockerDragApi {
  drop: (comp: AlloyComponent) => void;
  delayDrop: (comp: AlloyComponent) => void;
  forceDrop: (comp: AlloyComponent) => void;
  move: (evt: SugarEvent) => void;
}
