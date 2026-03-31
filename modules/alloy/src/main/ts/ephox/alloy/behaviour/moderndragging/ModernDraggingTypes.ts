
import type { SugarElement, SugarPosition } from '@ephox/sugar';

import type * as Behaviour from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { BehaviourState } from '../../behaviour/common/BehaviourState';

export interface ModernDraggingState extends BehaviourState {
  startDragging: (element: SugarElement<HTMLElement>, mousePosition: { x: number; y: number }) => void;
  getPreviousMousePosition: () => { x: number; y: number };
  updateMousePosition: (mousePosition: { x: number; y: number }) => void;
  getDraggingElement: () => SugarElement<HTMLElement> | null;
  isDragging: () => boolean;
  stopDragging: () => void;
}

export interface ModernDraggingBehaviour extends Behaviour.AlloyBehaviour<ModernDraggingConfigSpec, ModernDraggingConfig, ModernDraggingState> {
  config: (config: ModernDraggingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ModernDraggingConfigSpec, ModernDraggingConfig, ModernDraggingState>;
}

export interface ModernDraggingConfigSpec extends Behaviour.BehaviourConfigSpec {
  onDrag?: (comp: AlloyComponent, delta: SugarPosition) => void;
  onDragStart?: (comp: AlloyComponent) => void;
  onDragStop?: (comp: AlloyComponent) => void;
}

export interface ModernDraggingConfig extends Behaviour.BehaviourConfigDetail {
  onDrag: (comp: AlloyComponent, delta: SugarPosition) => void;
  onDragStart: (comp: AlloyComponent) => void;
  onDragStop: (comp: AlloyComponent) => void;
}
