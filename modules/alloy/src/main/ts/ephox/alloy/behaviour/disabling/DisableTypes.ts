import { Optional } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { BehaviourState } from '../common/BehaviourState';

export interface DisableBehaviour extends Behaviour.AlloyBehaviour<DisableConfigSpec, DisableConfig> {
  config: (config: DisableConfigSpec) => Behaviour.NamedConfiguredBehaviour<DisableConfigSpec, DisableConfig>;
  enable: (component: AlloyComponent) => void;
  disable: (component: AlloyComponent) => void;
  isDisabled: (component: AlloyComponent) => boolean;
  onLoad: (component: AlloyComponent) => void;
  set: (component: AlloyComponent, disabled: boolean, storeState?: boolean) => void;
  getLastDisabledState: (component: AlloyComponent) => boolean;
}

export interface DisableConfig extends Behaviour.BehaviourConfigDetail {
  disabled: () => boolean;
  disableClass: Optional<string>;
  useNative: boolean;
  onEnabled: (comp: AlloyComponent) => void;
  onDisabled: (comp: AlloyComponent) => void;
}

export interface DisableConfigSpec extends Behaviour.BehaviourConfigSpec {
  disabled?: () => boolean;
  disableClass?: string;
  useNative?: boolean;
  onEnabled?: (comp: AlloyComponent) => void;
  onDisabled?: (comp: AlloyComponent) => void;
}

export interface DisableState extends BehaviourState {
  getLastDisabledState: () => boolean;
  setLastDisabledState: (state: boolean) => void;
}
