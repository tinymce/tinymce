import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';

export interface RepresentingBehaviour extends Behaviour.AlloyBehaviour<RepresentingConfigSpec, RepresentingConfig> {
  config: (config: RepresentingConfigSpec) => Behaviour.NamedConfiguredBehaviour<RepresentingConfigSpec, RepresentingConfig>;
  setValueFrom: (component: AlloyComponent, source: AlloyComponent) => void;
  setValue: (component: AlloyComponent, value: any) => void;
  getValue: (component: AlloyComponent) => any;
}

// NOTE: I'm not sure we have any guarantees on what this can be.
export type RepresentingData = any;

export interface RepresentingConfigSpec extends BehaviourConfigSpec {
  store: {
    mode: string,
    initialValue?: RepresentingData,
    getFallbackEntry?: (key: string) => RepresentingData,
    getDataKey?: (comp: AlloyComponent) => string,
    setData?: (comp: AlloyComponent, data: RepresentingData ) => void;
    getValue?: (...any) => RepresentingData;
    setValue?: (...any) => void;
  };
  onSetValue?: (comp: AlloyComponent, data: RepresentingData) => void;
}

export interface RepresentingState { };

export interface RepresentingConfig extends BehaviourConfigDetail {
  resetOnDom: () => boolean;
  store: () => {
    manager: () => {
      setValue: (AlloyComponent, RepresentingConfig, RepresentingState, data: RepresentingData) => void;
      getValue: (AlloyComponent, RepresentingConfig, RepresentingState) => RepresentingData;
      onLoad: (AlloyComponent, RepresentingConfig, RepresentingState) => void;
      onUnload: (AlloyComponent, RepresentingConfig, RepresentingState) => void;
    }
  }
}