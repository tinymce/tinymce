import NoState from './NoState';
import { FieldPresence } from '@ephox/boulder';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { JSON } from '@ephox/sand';

var generateFrom = function (spec, all) {
  var schema = Arr.map(all, function (a) {
    return FieldSchema.field(a.name(), a.name(), FieldPresence.asOption(), ValueSchema.objOf([
      FieldSchema.strict('config'),
      FieldSchema.defaulted('state', NoState)
    ]));
  });

  var validated = ValueSchema.asStruct('component.behaviours', ValueSchema.objOf(schema), spec.behaviours).fold(function (errInfo) {
    throw new Error(
      ValueSchema.formatError(errInfo) + '\nComplete spec:\n' +
        JSON.stringify(spec, null, 2)
    );
  }, Fun.identity);

  return {
    list: all,
    data: Obj.map(validated, function (blobOptionThunk/*, rawK */) {
      var blobOption = blobOptionThunk();
      return Fun.constant(blobOption.map(function (blob) {
        return {
          config: blob.config(),
          state: blob.state().init(blob.config())
        };
      }));
    })
  };
};

var getBehaviours = function (bData) {
  return bData.list;
};

var getData = function (bData) {
  return bData.data;
};

export default <any> {
  generateFrom: generateFrom,
  getBehaviours: getBehaviours,
  getData: getData
};