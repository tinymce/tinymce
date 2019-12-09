import { FieldProcessorAdt, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Obj, Option } from '@ephox/katamari';

import { BehaviourState, BehaviourStateInitialiser, NoState } from './BehaviourState';
import { AlloyBehaviour, BehaviourRecord, BehaviourConfigDetail, BehaviourConfigSpec } from './BehaviourTypes';

export interface BehaviourConfigAndState<C extends BehaviourConfigDetail, S extends BehaviourState> {
  config: C;
  state: S;
}

export interface BehaviourSpec<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState> {
  config: C;
  state: BehaviourStateInitialiser<D, S>;
}

export interface BehaviourData<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState> {
  list: Array<AlloyBehaviour<C, D, S>>;
  data: Record<string, () => Option<BehaviourConfigAndState<D, S>>>;
}

const generateFrom = (spec: { behaviours?: BehaviourRecord }, all: Array<AlloyBehaviour<BehaviourConfigSpec, BehaviourConfigDetail, BehaviourState>>): BehaviourData<BehaviourConfigSpec, BehaviourConfigDetail, BehaviourState> => {
  /*
   * This takes a basic record of configured behaviours, defaults their state
   * and ensures that all the behaviours were valid. Will need to document
   * this entire process. Let's see where this is used.
   */
  const schema: FieldProcessorAdt[] = Arr.map(all, (a) => {
    // Option here probably just due to ForeignGui listing everything it supports. Can most likely
    // change it to strict once I fix the other errors.
    return FieldSchema.optionObjOf(a.name(), [
      FieldSchema.strict('config'),
      FieldSchema.defaulted('state', NoState)
    ]);
  });

  type B = Record<string, Option<BehaviourSpec<BehaviourConfigSpec, BehaviourConfigDetail, BehaviourState>>>;
  const validated = ValueSchema.asRaw<B>(
    'component.behaviours',
    ValueSchema.objOf(schema),
    spec.behaviours
  ).fold((errInfo) => {
    throw new Error(
      ValueSchema.formatError(errInfo) + '\nComplete spec:\n' +
        JSON.stringify(spec, null, 2)
    );
  }, (v) => v);

  return {
    list: all,
    data: Obj.map(validated, (optBlobThunk) => {
      const output = optBlobThunk.map((blob) => ({
        config: blob.config,
        state: blob.state.init(blob.config)
      }));
      return () => output;
    })
  };
};

const getBehaviours = <C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState>(bData: BehaviourData<C, D, S>): Array<AlloyBehaviour<C, D, S>> => {
  return bData.list;
};

const getData = <C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState>(bData: BehaviourData<C, D, S>): Record<string, () => Option<BehaviourConfigAndState<D, S>>> => {
  return bData.data;
};

export {
  generateFrom,
  getBehaviours,
  getData
};
