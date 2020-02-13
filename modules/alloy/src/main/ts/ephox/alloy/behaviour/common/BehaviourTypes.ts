import { FieldProcessorAdt } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloyEventRecord } from '../../api/events/AlloyEvents';
import { DomDefinitionDetail } from '../../dom/DomDefinition';
import { DomModification } from '../../dom/DomModification';
import { BehaviourConfigAndState } from './BehaviourBlob';
import { BehaviourState, BehaviourStateInitialiser } from './BehaviourState';

export type BehaviourApiFunc<D extends BehaviourConfigDetail, S extends BehaviourState> = (component: AlloyComponent, bConfig: D, bState: S, ...rest: any[]) => any;

export type BehaviourRecord = Record<string, ConfiguredBehaviour<any, any, any>>;
export type BehaviourApisRecord<D extends BehaviourConfigDetail, S extends BehaviourState> = { [key: string]: BehaviourApiFunc<D, S> };
export type BehaviourExtraRecord<E> = { [K in keyof E]: Function };

export type BehaviourInfo<D extends BehaviourConfigDetail, S extends BehaviourState> = Record<string, () => Option<BehaviourConfigAndState<D, S>>>;

export interface BehaviourConfigSpec { }
export interface BehaviourConfigDetail { }

export interface BehaviourActiveSpec<D extends BehaviourConfigDetail, S extends BehaviourState> {
  exhibit?: (base: DomDefinitionDetail, config: D, state: S) => DomModification;
  events?: (config: D, state: S) => AlloyEventRecord;
}
export interface NamedConfiguredBehaviour<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState> {
  key: string;
  value: ConfiguredBehaviour<C, D, S>;
}

export interface AlloyBehaviour<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState> {
  config: (spec: C) => NamedConfiguredBehaviour<C, D, S>;
  exhibit: (
    info: BehaviourInfo<D, S>,
    base: DomDefinitionDetail
  ) => DomModification;
  handlers: (info: BehaviourInfo<D, S>) => {};
  name: () => string;
  revoke: () => NamedConfiguredBehaviour<C, D, S>;
  schema: () => FieldProcessorAdt;
}

export interface ConfiguredBehaviour<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState> {
  config: D;
  configAsRaw: () => D;
  initialConfig: C;
  me: AlloyBehaviour<C, D, S>;
  state: BehaviourStateInitialiser<D, S>;
}

export interface BaseBehaviourConfig<D extends BehaviourConfigDetail, S extends BehaviourState, A extends BehaviourApisRecord<D, S>, E extends BehaviourExtraRecord<E>> {
  name: string;
  active?: BehaviourActiveSpec<D, S>;
  apis?: A;
  extra?: E;
  state?: BehaviourStateInitialiser<D, S>;
}

export interface BehaviourConfig<D extends BehaviourConfigDetail, S extends BehaviourState, A extends BehaviourApisRecord<D, S>, E extends BehaviourExtraRecord<E> = {}> extends BaseBehaviourConfig<D, S, A, E> {
  fields: FieldProcessorAdt[];
}

export interface BehaviourModeSpec<D extends BehaviourConfigDetail, S extends BehaviourState, A extends BehaviourApisRecord<D, S>, E extends BehaviourExtraRecord<E> = {}> extends BaseBehaviourConfig<D, S, A, E>  {
  branchKey: string;
  branches: Record<string, FieldProcessorAdt[]>;
}
