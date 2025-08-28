import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { BehaviourState } from '../common/BehaviourState';

export interface SlidingBehaviour extends Behaviour.AlloyBehaviour<SlidingConfigSpec, SlidingConfig> {
  config: (config: SlidingConfigSpec) => Behaviour.NamedConfiguredBehaviour<SlidingConfigSpec, SlidingConfig>;
  refresh: (component: AlloyComponent) => void;
  grow: (component: AlloyComponent) => void;
  shrink: (component: AlloyComponent) => void;
  immediateShrink: (component: AlloyComponent) => void;
  hasGrown: (component: AlloyComponent) => boolean;
  hasShrunk: (component: AlloyComponent) => boolean;
  isGrowing: (component: AlloyComponent) => boolean;
  isShrinking: (component: AlloyComponent) => boolean;
  isTransitioning: (component: AlloyComponent) => boolean;
  toggleGrow: (component: AlloyComponent) => void;
  disableTransitions: (component: AlloyComponent) => void;
  immediateGrow: (component: AlloyComponent) => void;
}

export interface SlidingConfig extends Behaviour.BehaviourConfigDetail {
  expanded: boolean;
  openClass: string;
  closedClass: string;
  dimension: {
    property: string;
    getDimension: (elem: SugarElement<HTMLElement>) => string;
  };
  onGrown: (comp: AlloyComponent) => void;
  onShrunk: (comp: AlloyComponent) => void;
  shrinkingClass: string;
  growingClass: string;
  onStartGrow: (comp: AlloyComponent) => void;
  onStartShrink: (comp: AlloyComponent) => void;
  getAnimationRoot: Optional<(comp: AlloyComponent) => SugarElement<Element>>;

}

export interface SlidingState extends BehaviourState {
  isExpanded: () => boolean;
  setExpanded: () => void;
  isCollapsed: () => boolean;
  setCollapsed: () => void;
}

export interface SlidingConfigSpec extends Behaviour.BehaviourConfigSpec {
  dimension: {
    property: string;
  };
  closedClass: string;
  openClass: string;
  shrinkingClass: string;
  growingClass: string;
  onStartGrow?: (component: AlloyComponent) => void;
  getAnimationRoot?: (component: AlloyComponent) => SugarElement<Element>;
  onStartShrink?: (component: AlloyComponent) => void;
  onShrunk?: (component: AlloyComponent) => void;
  onGrown?: (component: AlloyComponent) => void;
  expanded?: boolean;
}
