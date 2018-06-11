import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { SugarElement } from '../../alien/TypeDefinitions';


export interface SlidingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: SlidingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  grow?: (component: AlloyComponent) => boolean;
  shrink?: (component: AlloyComponent) => void;
  immediateShrink?: (component: AlloyComponent) => void;
  hasGrown?: (component: AlloyComponent) => boolean;
  hasShrunk?: (component: AlloyComponent) => boolean;
  isGrowing?: (component: AlloyComponent) => boolean;
  isShrinking?: (component: AlloyComponent) => boolean;
  isTransitioning?: (component: AlloyComponent) => boolean;
  toggleGrow?: (component: AlloyComponent) => void;
  disableTransitions?: (component: AlloyComponent) => void;
}

export interface SlidingConfig {
  expanded: () => boolean;
  openClass: () => string;
  closedClass: () => string;
  dimension: () => {
    property: () => string;
  };
  onGrown: () => (AlloyComponent) => void;
  onShrunk: () => (AlloyComponent) => void;
  shrinkingClass: () => string;
  growingClass: () => string;
  onStartGrow: () => (AlloyComponent) => void;
  onStartShrink: () => (AlloyComponent) => void;
  getAnimationRoot: () => Option<(AlloyComponent) => SugarElement>;
    
};

export interface SlidingState {
  isExpanded: () => boolean;
};

export interface SlidingConfigSpec {
  dimension: {
    property: string
  };
  closedClass: string;
  openClass: string;
  shrinkingClass: string;
  growingClass: string;
  onStartGrow?: (component: AlloyComponent) => void;
  getAnimationRoot?: (component: AlloyComponent) => SugarElement;
  onStartShrink?: (component: AlloyComponent) => void;
  onShrunk?: (component: AlloyComponent) => void;
  onGrown?: (component: AlloyComponent) => void;
  expanded?: boolean;
}