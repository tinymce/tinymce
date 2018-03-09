import * as Behaviour from './Behaviour';
import * as ActiveSliding from '../../behaviour/sliding/ActiveSliding';
import * as SlidingApis from '../../behaviour/sliding/SlidingApis';
import SlidingSchema from '../../behaviour/sliding/SlidingSchema';
import * as SlidingState from '../../behaviour/sliding/SlidingState';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface SlidingBehaviour extends AlloyBehaviour {
  config: (SlidingConfig) => { key: string, value: any };
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

export interface SlidingConfig extends AlloyBehaviourConfig {
  dimension: {
    property: string
  };
  closedClass: string;
  openClass: string;
  shrinkingClass: string;
  growingClass: string;
  onShrunk: () => void;
  onGrown: () => void;
}

const Sliding: SlidingBehaviour = Behaviour.create({
  fields: SlidingSchema,
  name: 'sliding',
  active: ActiveSliding,
  apis: SlidingApis,
  state: SlidingState
});

export {
  Sliding
};