import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';


export interface TogglingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: TogglingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
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

export interface TogglingConfig {
  toggleClass: () => string;
  aria: () => AriaTogglingConfig;
  toggleOnExecute: () => boolean;
  selected: () => boolean;
}

export interface TogglingConfigSpec {
  toggleClass: string;
  aria?: {
    mode: TogglingMode;
    syncWithExpanded?: boolean;
  };
  toggleOnExecute?: boolean;
  selected?: boolean;
}

export type TogglingMode = 'expanded' | 'pressed' | 'checked' | 'toggled' | 'selected' | 'none';
