import { FieldProcessor, FieldSchema, StructureSchema } from '@ephox/boulder';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';

import { BehaviourState, BehaviourStateInitialiser, NoState } from './BehaviourState';
import { AlloyBehaviour, BehaviourConfigDetail, BehaviourConfigSpec, BehaviourRecord } from './BehaviourTypes';

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
  data: Record<string, () => Optional<BehaviourConfigAndState<D, S>>>;
}

const generateFrom = (spec: { behaviours?: BehaviourRecord }, all: Array<AlloyBehaviour<BehaviourConfigSpec, BehaviourConfigDetail, BehaviourState>>): BehaviourData<BehaviourConfigSpec, BehaviourConfigDetail, BehaviourState> => {
  /*
   * This takes a basic record of configured behaviours, defaults their state
   * and ensures that all the behaviours were valid. Will need to document
   * this entire process. Let's see where this is used.
   */
  const schema: FieldProcessor[] = Arr.map(all, (a) =>
    // Optional here probably just due to ForeignGui listing everything it supports. Can most likely
    // change it to strict once I fix the other errors.
    FieldSchema.optionObjOf(a.name(), [
      FieldSchema.required('config'),
      FieldSchema.defaulted('state', NoState)
    ])
  );

  type B = Record<string, Optional<BehaviourSpec<BehaviourConfigSpec, BehaviourConfigDetail, BehaviourState>>>;
  const validated = StructureSchema.asRaw<B>(
    'component.behaviours',
    StructureSchema.objOf(schema),
    spec.behaviours
  ).fold((errInfo) => {
    throw new Error(
      StructureSchema.formatError(errInfo) + '\nComplete spec:\n' +
        JSON.stringify(spec, null, 2)
    );
  }, Fun.identity);

  return {
    list: all,
    data: Obj.map(validated, (optBlobThunk) => {
      const output = optBlobThunk.map((blob) => ({
        config: blob.config,
        state: blob.state.init(blob.config)
      }));
      return Fun.constant(output);
    })
  };
};

const getBehaviours = <C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState>(bData: BehaviourData<C, D, S>): Array<AlloyBehaviour<C, D, S>> => bData.list;

const getData = <C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState>(bData: BehaviourData<C, D, S>): Record<string, () => Optional<BehaviourConfigAndState<D, S>>> => bData.data;

export {
  generateFrom,
  getBehaviours,
  getData
};
