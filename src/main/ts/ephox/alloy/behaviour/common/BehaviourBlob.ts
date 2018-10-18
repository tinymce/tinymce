import { FieldPresence, FieldSchema, ValueSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Arr, Fun, Obj, Option } from '@ephox/katamari';
import { JSON } from '@ephox/sand';

import { NoState, BehaviourStateInitialiser, BehaviourState } from '../../behaviour/common/BehaviourState';
import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import { AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { LumberTimers } from '../../alien/LumberTimers';

export interface BehaviourConfigAndState<C, S> {
  config: () => C;
  state: S;
}

export interface BehaviourData {
  list: Array<AlloyBehaviour<any, any>>;
  data: Record<string, () => Option<BehaviourConfigAndState<any, BehaviourState>>>;
}

const generateFrom = (spec: SimpleOrSketchSpec, all: Array<AlloyBehaviour<any, any>>): BehaviourData => {
  /*
   * This takes a basic record of configured behaviours, defaults their state
   * and ensures that all the behaviours were valid. Will need to document
   * this entire process. Let's see where this is used.
   */
  const schema: FieldProcessorAdt[] = LumberTimers.run('bBlob.schema', () => Arr.map(all, (a) => {
    // Option here probably just due to ForeignGui listing everything it supports. Can most likely
    // change it to strict once I fix the other errors.
    return FieldSchema.optionObjOf(a.name(), [
      FieldSchema.strict('config'),
      FieldSchema.defaulted('state', NoState)
    ]);
  }));

  type B = Record<string, () => Option<BehaviourConfigAndState<any, () => BehaviourStateInitialiser<any>>>>;
  const validated = LumberTimers.run('bBlob.validated', () => ValueSchema.asRaw('component.behaviours', ValueSchema.objOf(schema), spec.behaviours).fold((errInfo) => {
    throw new Error(
      ValueSchema.formatError(errInfo) + '\nComplete spec:\n' +
        JSON.stringify(spec, null, 2)
    );
  }, (v: B) => v));
/*


taview: () => Option({
  config: () => tabviewconfig
  state: () => NoState (BehaviourStateInitialiser)
})

*/

  return {
    list: all as Array<AlloyBehaviour<any, any>>,
    data: LumberTimers.run('bBlob.data', () => Obj.map(validated, (optBlobThunk) => {
      const optBlob = optBlobThunk;
      const output = optBlob.map((blob) => ({
        config: blob.config,
        state: blob.state.init(blob.config)
      }));
      return () => output;
    }))
  };
};

const getBehaviours = (bData: BehaviourData): Array<AlloyBehaviour<any, any>> => {
  return bData.list;
};

const getData = (bData: BehaviourData): Record<string, () => Option<BehaviourConfigAndState<any, BehaviourState>>> => {
  return bData.data;
};

export {
  generateFrom,
  getBehaviours,
  getData
};