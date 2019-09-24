import { getNamedItems, getDataProcessor } from './DataProcessors';
import { FieldSchema, ValueSchema, Processor } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { DialogApi } from '../components/dialog/Dialog';

export const createDataValidator = <T>(structure: DialogApi<T>): Processor => {
  const namedItems = getNamedItems(structure);
  const fields = Arr.bind(namedItems, (item) => {
    return getDataProcessor(item).fold(
      () => [],
      (schema) => [ FieldSchema.strictOf(item.name, schema) ]
    );
  });

  return ValueSchema.objOf(fields);
};
