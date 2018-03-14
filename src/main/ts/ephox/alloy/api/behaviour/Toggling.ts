import * as Behaviour from './Behaviour';
import * as ActiveToggle from '../../behaviour/toggling/ActiveToggle';
import * as ToggleApis from '../../behaviour/toggling/ToggleApis';
import ToggleSchema from '../../behaviour/toggling/ToggleSchema';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface TogglingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: TogglingConfig) => { [key: string]: (any) => any };
  onLoad?: (component: AlloyComponent) => void;
  toggle?: (component: AlloyComponent) => void;
  isOn?: (component: AlloyComponent) => boolean;
  on?: (component: AlloyComponent) => void;
  off?: (component: AlloyComponent) => void;
}

export interface TogglingConfig {
  toggleClass: string;
  aria?: {
    mode: TogglingMode;
    syncWithExpanded?: boolean;
  };
}

export type TogglingMode = 'pressed' | 'checked' | 'toggled' | 'selected';

const Toggling: TogglingBehaviour = Behaviour.create({
  fields: ToggleSchema,
  name: 'toggling',
  active: ActiveToggle,
  apis: ToggleApis
});

export {
  Toggling
};