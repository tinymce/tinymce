import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { BehaviourState } from '../../behaviour/common/BehaviourState';
import { ItemDataTuple } from '../../ui/types/ItemTypes';

export interface RepresentingBehaviour extends Behaviour.AlloyBehaviour<RepresentingConfigSpec, RepresentingConfig> {
  config: (config: RepresentingConfigSpec) => Behaviour.NamedConfiguredBehaviour<RepresentingConfigSpec, RepresentingConfig>;
  setValueFrom: (component: AlloyComponent, source: AlloyComponent) => void;
  setValue: (component: AlloyComponent, value: any) => void;
  getValue: (component: AlloyComponent) => any;
  getState: (component: AlloyComponent) => RepresentingState;
}

// NOTE: I'm not sure we have any guarantees on what this can be.
export type RepresentingData = any;

export interface MemoryStoreConfigSpec {
  mode: 'memory';
  initialValue?: RepresentingData;
}

export interface MemoryStoreConfig {
  initialValue: Option<RepresentingData>;
}

export interface ManualStoreConfigSpec {
  mode: 'manual';
  initialValue?: RepresentingData;
  getValue: (comp: AlloyComponent) => RepresentingData;
  setValue?: (comp: AlloyComponent, data: RepresentingData) => void;
}

export interface ManualStoreConfig {
  initialValue: Option<RepresentingData>;
  getValue: (comp: AlloyComponent) => RepresentingData;
  setValue: (comp: AlloyComponent, data: RepresentingData) => void;
}

export type DatasetStoreKey = string;
export interface DatasetStoreConfigSpec<T extends ItemDataTuple> {
  mode: 'dataset';
  initialValue?: T;
  getFallbackEntry: (key: DatasetStoreKey) => T;
  getDataKey: (comp: AlloyComponent) => DatasetStoreKey;
  setValue: (comp: AlloyComponent, data: T) => void;
}

export interface DatasetStoreConfig<T extends ItemDataTuple> {
  initialValue?: Option<T>;
  getFallbackEntry: (key: DatasetStoreKey) => T;
  getDataKey?: (comp: AlloyComponent) => DatasetStoreKey;
  setValue: (comp: AlloyComponent, data: T) => void;
}

export interface RepresentingConfigSpec extends Behaviour.BehaviourConfigSpec {
  store: MemoryStoreConfigSpec | ManualStoreConfigSpec | DatasetStoreConfigSpec<RepresentingData>;
  onSetValue?: (comp: AlloyComponent, data: RepresentingData) => void;
}

export interface RepresentingState extends BehaviourState { }

export interface RepresentingConfig extends Behaviour.BehaviourConfigDetail {
  resetOnDom: boolean;
  store: {
    manager: {
      setValue: (comp: AlloyComponent, config: RepresentingConfig, state: RepresentingState, data: RepresentingData) => void;
      getValue: (comp: AlloyComponent, config: RepresentingConfig, state: RepresentingState) => RepresentingData;
      onLoad: (comp: AlloyComponent, config: RepresentingConfig, state: RepresentingState) => void;
      onUnload: (comp: AlloyComponent, config: RepresentingConfig, state: RepresentingState) => void;
    }
  };
}