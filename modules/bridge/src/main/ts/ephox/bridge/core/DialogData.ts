import { FieldSchema, Processor, ValueSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { DialogSpec } from '../components/dialog/Dialog';
import { getDataProcessor, getNamedItems } from './DataProcessors';

export const createDataValidator = <T>(structure: DialogSpec<T>): Processor => {
  const namedItems = getNamedItems(structure);
  const fields = Arr.bind(namedItems, (item) => getDataProcessor(item).fold(
    () => [],
    (schema) => [ FieldSchema.strictOf(item.name, schema) ]
  ));

  return ValueSchema.objOf(fields);
};
