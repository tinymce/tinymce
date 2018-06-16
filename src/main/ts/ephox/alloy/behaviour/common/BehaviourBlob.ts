import { FieldPresence, FieldSchema, ValueSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Arr, Fun, Obj } from '@ephox/katamari';
import { JSON } from '@ephox/sand';

import * as NoState from './NoState';
import { SimpleOrSketchSpec } from 'ephox/alloy/api/component/SpecTypes';
import { AlloyBehaviour } from 'ephox/alloy/api/behaviour/Behaviour';

const generateFrom = (spec: SimpleOrSketchSpec, all: AlloyBehaviour[]) => {
  /*
   * This takes a basic record of configured behaviours, defaults their state
   * and ensures that all the behaviours were valid. Will need to document
   * this entire process. Let's see where this is used.
   */
  const schema: FieldProcessorAdt[] = Arr.map(all, (a) => {
    return FieldSchema.field(a.name(), a.name(), FieldPresence.asOption(), ValueSchema.objOf([
      FieldSchema.strict('config'),
      FieldSchema.defaulted('state', NoState)
    ]));
  });

  const validated = ValueSchema.asStruct('component.behaviours', ValueSchema.objOf(schema), spec.behaviours).fold((errInfo) => {
    throw new Error(
      ValueSchema.formatError(errInfo) + '\nComplete spec:\n' +
        JSON.stringify(spec, null, 2)
    );
  }, (v: any) => v);

  return {
    list: all as AlloyBehaviour[],
    data: Obj.map(validated, (blobOptionThunk/*, rawK */) => {
      const blobOption = blobOptionThunk();
      return Fun.constant(blobOption.map((blob) => {
        return {
          config: blob.config(),
          state: blob.state().init(blob.config())
        };
      }));
    })
  };
};

const getBehaviours = (bData) => {
  return bData.list;
};

const getData = (bData) => {
  return bData.data;
};

export {
  generateFrom,
  getBehaviours,
  getData
};