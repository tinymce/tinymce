import * as Behaviour from './Behaviour';
import * as ActiveDocking from '../../behaviour/docking/ActiveDocking';
import DockingSchema from '../../behaviour/docking/DockingSchema';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';

export interface DockingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: DockingConfig) => Behaviour.NamedConfiguredBehaviour;
}

export interface ViewportBox {
  x: () => number;
  y: () => number;
  bottom?: () => number;
  top?: () => number;
  width?: () => number;
  heigth?: () => number;
}

export interface DockingConfig {
  contextual?: {
    fadeInClass: string;
    fadeOutClass: string;
    transitionClass: string;
    lazyContext: (component: AlloyComponent) => Option<SugarElement>;
  };
  lazyViewport?: (component?: AlloyComponent) => ViewportBox;
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
