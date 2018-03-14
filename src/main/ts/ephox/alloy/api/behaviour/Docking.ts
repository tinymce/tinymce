import * as Behaviour from './Behaviour';
import * as ActiveDocking from '../../behaviour/docking/ActiveDocking';
import DockingSchema from '../../behaviour/docking/DockingSchema';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface DockingBehaviour extends Behaviour.AlloyBehaviour {
  config: <T>(config: DockingConfig<T>) => { [key: string]: (any) => any };
}

export interface DockingConfig<T> extends Behaviour.AlloyBehaviourConfig {
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

const Docking = Behaviour.create({
  fields: DockingSchema,
  name: 'docking',
  active: ActiveDocking
}) as DockingBehaviour;

export {
  Docking
};
