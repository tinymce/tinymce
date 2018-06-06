import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';


export interface SlidingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: SlidingConfig) => Behaviour.NamedConfiguredBehaviour;
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