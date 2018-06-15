import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Obj } from '@ephox/katamari';
import { JSON } from '@ephox/sand';

import * as NoState from './NoState';

const generateFrom = (spec, all) => {
  const schema = Arr.map(all, (a) => {
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
  }, Fun.identity);

  return {
    list: all,
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

export default <any> {
  generateFrom,
  getBehaviours,
  getData
};