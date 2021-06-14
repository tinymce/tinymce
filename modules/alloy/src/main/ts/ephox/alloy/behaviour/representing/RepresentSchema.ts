import { FieldSchema, StructureSchema } from '@ephox/boulder';

import * as Fields from '../../data/Fields';
import DatasetStore from './DatasetStore';
import ManualStore from './ManualStore';
import MemoryStore from './MemoryStore';

export default [
  FieldSchema.defaultedOf('store', { mode: 'memory' }, StructureSchema.choose('mode', {
    memory: MemoryStore,
    manual: ManualStore,
    dataset: DatasetStore
  })),
  Fields.onHandler('onSetValue'),
  FieldSchema.defaulted('resetOnDom', false)
];
