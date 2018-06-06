import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';

export interface RepresentingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: RepresentingConfig) => Behaviour.NamedConfiguredBehaviour;
  setValueFrom: (component: AlloyComponent, source: AlloyComponent) => void;
  setValue: (component: AlloyComponent, value: any) => void;
  getValue: (component: AlloyComponent) => any;
}

// NOTE: I'm not sure we have any guarantees on what this can be.
export type RepresentingData = any;

export interface RepresentingConfig {
  store: {
    mode: string,
    initialValue?: any,
    getFallbackEntry?: (key: string) => RepresentingData,
    getDataKey?: (typeAhead: AlloyComponent) => string,
    setData?: (typeAhead: AlloyComponent, data: RepresentingData ) => void;
    getValue?: (...any) => any;
    setValue?: (...any) => void;
  };
  onSetValue?: (comp: AlloyComponent, data: RepresentingData) => void;
}