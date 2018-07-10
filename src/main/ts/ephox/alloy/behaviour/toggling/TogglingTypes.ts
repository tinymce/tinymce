import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';

export interface TogglingBehaviour extends Behaviour.AlloyBehaviour<TogglingConfigSpec, TogglingConfig> {
  config: (config: TogglingConfigSpec) => Behaviour.NamedConfiguredBehaviour<TogglingConfigSpec, TogglingConfig>;
  onLoad?: (component: AlloyComponent) => void;
  toggle?: (component: AlloyComponent) => void;
  isOn?: (component: AlloyComponent) => boolean;
  on?: (component: AlloyComponent) => void;
  off?: (component: AlloyComponent) => void;
  set?: (component: AlloyComponent, state: boolean) => void;
}

export interface AriaTogglingConfig {
  update: () => (comp: AlloyComponent, ariaConfig: AriaTogglingConfig, state: boolean) => void;
  syncWithExpanded: () => boolean;
}

export interface TogglingConfig extends Behaviour.BehaviourConfigDetail {
  toggleClass: () => string;
  aria: () => AriaTogglingConfig;
  toggleOnExecute: () => boolean;
  selected: () => boolean;
}

export interface TogglingConfigSpec extends Behaviour.BehaviourConfigSpec {
  toggleClass: string;
  aria?: {
    mode: TogglingMode;
    syncWithExpanded?: boolean;
  };
  toggleOnExecute?: boolean;
  selected?: boolean;
}

export type TogglingMode = 'expanded' | 'pressed' | 'checked' | 'toggled' | 'selected' | 'none';
