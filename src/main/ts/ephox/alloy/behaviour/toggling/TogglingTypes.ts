import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';


export interface TogglingBehaviour extends Behaviour.AlloyBehaviour<TogglingConfigSpec, TogglingConfig> {
  config: (config: TogglingConfigSpec) => Behaviour.NamedConfiguredBehaviour<TogglingConfigSpec, TogglingConfig>;
  onLoad?: (component: AlloyComponent) => void;
  toggle?: (component: AlloyComponent) => void;
  isOn?: (component: AlloyComponent) => boolean;
  on?: (component: AlloyComponent) => void;
  off?: (component: AlloyComponent) => void;
}

export interface AriaTogglingConfig {
  update: () => (AlloyComponent, AriaTogglingConfig, boolean) => void;
  syncWithExpanded: () => boolean;
}

export interface TogglingConfig extends BehaviourConfigDetail{
  toggleClass: () => string;
  aria: () => AriaTogglingConfig;
  toggleOnExecute: () => boolean;
  selected: () => boolean;
}

export interface TogglingConfigSpec extends BehaviourConfigSpec {
  toggleClass: string;
  aria?: {
    mode: TogglingMode;
    syncWithExpanded?: boolean;
  };
  toggleOnExecute?: boolean;
  selected?: boolean;
}

export type TogglingMode = 'expanded' | 'pressed' | 'checked' | 'toggled' | 'selected' | 'none';
