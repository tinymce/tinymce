import * as Behaviour from './Behaviour';
import * as ActiveSliding from '../../behaviour/sliding/ActiveSliding';
import * as SlidingApis from '../../behaviour/sliding/SlidingApis';
import SlidingSchema from '../../behaviour/sliding/SlidingSchema';
import * as SlidingState from '../../behaviour/sliding/SlidingState';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';

export interface SlidingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: SlidingConfig) => { [key: string]: (any) => any };
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

const Sliding = Behaviour.create({
  fields: SlidingSchema,
  name: 'sliding',
  active: ActiveSliding,
  apis: SlidingApis,
  state: SlidingState
}) as SlidingBehaviour;

export {
  Sliding
};