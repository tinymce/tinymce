import * as Behaviour from './Behaviour';
import * as ActiveDocking from '../../behaviour/docking/ActiveDocking';
import DockingSchema from '../../behaviour/docking/DockingSchema';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface DockingBehaviour extends AlloyBehaviour {
  config: (DockingConfig) => any;
}

export interface DockingConfig<T> extends AlloyBehaviourConfig {
  contextual: {
    fadeInClass: string;
    fadeOutClass: string;
    transitionClass: string;
    lazyContext: (component: AlloyComponent) => Option<T>;
  };
  lazyViewport: (component?: AlloyComponent) => any;
  leftAttr: string;
  topAttr: string;
}

const Docking: DockingBehaviour = Behaviour.create({
  fields: DockingSchema,
  name: 'docking',
  active: ActiveDocking
});

export {
  Docking
};
