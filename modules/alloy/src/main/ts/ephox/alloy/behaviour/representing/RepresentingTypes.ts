import { Optional } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { ItemDataTuple } from '../../ui/types/ItemTypes';
import { BehaviourState } from '../common/BehaviourState';

export interface RepresentingBehaviour extends Behaviour.AlloyBehaviour<RepresentingConfigSpec, RepresentingConfig> {
  config: (config: RepresentingConfigSpec) => Behaviour.NamedConfiguredBehaviour<RepresentingConfigSpec, RepresentingConfig>;
  setValueFrom: (component: AlloyComponent, source: AlloyComponent) => void;
  setValue: (component: AlloyComponent, value: any) => void;
  getValue: (component: AlloyComponent) => any;
  getState: (component: AlloyComponent) => RepresentingState;
}

export interface RepresentingState extends BehaviourState { }

export interface MemoryRepresentingState extends RepresentingState {
  get: <T>() => T;
  set: <T>(value: T) => void;
  isNotSet: () => boolean;
  clear: () => void;
}

export interface ManualRepresentingState extends RepresentingState { }

export interface DatasetRepresentingState extends RepresentingState {
  lookup: <T extends ItemDataTuple>(itemString: string) => Optional<T>;
  update: <T extends ItemDataTuple>(items: T[]) => void;
  clear: () => void;
}

// NOTE: I'm not sure we have any guarantees on what this can be.
export type RepresentingData = any;

interface BaseStoreConfig<T, S extends RepresentingState> {
  initialValue: Optional<T>;
  manager: {
    setValue: (comp: AlloyComponent, config: RepresentingConfig, state: RepresentingState, data: RepresentingData) => void;
    getValue: (comp: AlloyComponent, config: RepresentingConfig, state: RepresentingState) => RepresentingData;
    onLoad: (comp: AlloyComponent, config: RepresentingConfig, state: RepresentingState) => void;
    onUnload: (comp: AlloyComponent, config: RepresentingConfig, state: RepresentingState) => void;
    state: (spec: RepresentingConfig) => S;
  };
}

export interface MemoryStoreConfigSpec {
  mode: 'memory';
  initialValue?: RepresentingData;
}

export interface MemoryStoreConfig extends BaseStoreConfig<RepresentingData, MemoryRepresentingState> { }

export interface ManualStoreConfigSpec {
  mode: 'manual';
  initialValue?: RepresentingData;
  getValue: (comp: AlloyComponent) => RepresentingData;
  setValue?: (comp: AlloyComponent, data: RepresentingData) => void;
}

export interface ManualStoreConfig extends BaseStoreConfig<RepresentingData, ManualRepresentingState> {
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

export interface DatasetStoreConfig<T extends ItemDataTuple> extends BaseStoreConfig<T, DatasetRepresentingState> {
  getFallbackEntry: (key: DatasetStoreKey) => T;
  getDataKey: (comp: AlloyComponent) => DatasetStoreKey;
  setValue: (comp: AlloyComponent, data: T) => void;
}

export interface RepresentingConfigSpec extends Behaviour.BehaviourConfigSpec {
  store: MemoryStoreConfigSpec | ManualStoreConfigSpec | DatasetStoreConfigSpec<RepresentingData>;
  onSetValue?: (comp: AlloyComponent, data: RepresentingData) => void;
}

export interface RepresentingConfig extends Behaviour.BehaviourConfigDetail {
  resetOnDom: boolean;
  store: MemoryStoreConfig | ManualStoreConfig | DatasetStoreConfig<RepresentingData>;
  onSetValue: (comp: AlloyComponent, data: RepresentingData) => void;
}
