import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface SlidingBehaviour extends Behaviour.AlloyBehaviour<SlidingConfigSpec, SlidingConfig> {
  config: (config: SlidingConfigSpec) => Behaviour.NamedConfiguredBehaviour<SlidingConfigSpec, SlidingConfig>;
  refresh?: (component: AlloyComponent) => void;
  grow?: (component: AlloyComponent) => void;
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

export interface SlidingConfig extends Behaviour.BehaviourConfigDetail {
  expanded: boolean;
  openClass: string;
  closedClass: string;
  dimension: {
    property: string;
    getDimension: (elem: Element) => string;
  };
  onGrown: (comp: AlloyComponent) => void;
  onShrunk: (comp: AlloyComponent) => void;
  shrinkingClass: string;
  growingClass: string;
  onStartGrow: (comp: AlloyComponent) => void;
  onStartShrink: (comp: AlloyComponent) => void;
  getAnimationRoot: Option<(comp: AlloyComponent) => Element>;

}

export interface SlidingState {
  isExpanded: () => boolean;
}

export interface SlidingConfigSpec extends Behaviour.BehaviourConfigSpec {
  dimension: {
    property: string
  };
  closedClass: string;
  openClass: string;
  shrinkingClass: string;
  growingClass: string;
  onStartGrow?: (component: AlloyComponent) => void;
  getAnimationRoot?: (component: AlloyComponent) => Element;
  onStartShrink?: (component: AlloyComponent) => void;
  onShrunk?: (component: AlloyComponent) => void;
  onGrown?: (component: AlloyComponent) => void;
  expanded?: boolean;
}
